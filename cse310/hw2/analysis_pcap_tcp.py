import dpkt
import socket

from ds import MinHeap, STATE, Packet,Flow 


transactions = [STATE.IN_PROGRESS, STATE.FIRST_TRANSACTION_SENT, STATE.SECOND_TRANSACTION_SENT, STATE.SENT_FIN, STATE.RECEIVED_FIN_ACK, STATE.ENDING]
f = open('assignment2.pcap', 'rb')
pcap = dpkt.pcap.Reader(f)

flows = dict()
one_flow = None
time = -1
MAX = 10000000000
PACKET_COUNT = 0
PACKET_CONTROL = MAX


for timestamp, buf in pcap:
    if PACKET_COUNT == PACKET_CONTROL:
        break
    PACKET_COUNT += 1
    eth = dpkt.ethernet.Ethernet(buf)
    if time == -1:
        time = timestamp
    if isinstance(eth.data, dpkt.ip.IP):
        ip = eth.data
        src_ip = socket.inet_ntoa(ip.src)
        dst_ip = socket.inet_ntoa(ip.dst)
        packet_size = len(ip.data)
        if isinstance(ip.data, dpkt.tcp.TCP):
            tcp = ip.data
            src_port = tcp.sport
            dst_port = tcp.dport
            protocol = "TCP"
        conn_key = (src_ip, src_port, dst_ip, dst_port)
        conn_key_reverse = (dst_ip, dst_port, src_ip, src_port)
        CURR_FLOW_ = Flow(conn_key, ip, ip.data, timestamp - time)
        if conn_key in flows.keys():
            CURR_FLOW_ = flows[conn_key]
            CURR_FLOW_.data_sent += packet_size
        elif conn_key_reverse in flows.keys():
            CURR_FLOW_ = flows[conn_key_reverse]
        else:
            CURR_FLOW_.data_sent += packet_size
            flows[conn_key] = CURR_FLOW_
        
        if tcp.flags & dpkt.tcp.TH_SYN and tcp.flags & dpkt.tcp.TH_ACK:
            if CURR_FLOW_.state == STATE.SENT_FIRST_SYN:
                CURR_FLOW_.state = STATE.RECEIVED_SYN_ACK
        elif tcp.flags & dpkt.tcp.TH_FIN and tcp.flags & dpkt.tcp.TH_ACK:
            if CURR_FLOW_.state == STATE.SENT_FIN:
                CURR_FLOW_.state = STATE.RECEIVED_FIN_ACK
        elif tcp.flags & dpkt.tcp.TH_SYN:
            if CURR_FLOW_.state == STATE.LOADING:
                CURR_FLOW_.state = STATE.SENT_FIRST_SYN
        elif tcp.flags & dpkt.tcp.TH_FIN:
            # Maybe the other person can initiate FIN?
            if CURR_FLOW_.state == STATE.IN_PROGRESS and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.SENT_FIN
        elif tcp.flags & dpkt.tcp.TH_ACK:
            if CURR_FLOW_.state == STATE.RECEIVED_SYN_ACK:
                CURR_FLOW_.state = STATE.SENT_SECOND_SYN
            if CURR_FLOW_.state == STATE.SENT_SECOND_SYN and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.FIRST_TRANSACTION_SENT
                # This packet is sending the first transaction
                # print("FIRST TRANSACTION")
                # print(conn_key)
                sequence_number = tcp.seq
                ack_number = tcp.ack
                window_size = tcp.win
                # print("Sequence number:", sequence_number)
                # print("Ack number:", ack_number)
                # print("Receive Window size:", window_size)
                # print("-------------------------------------")
            if conn_key in flows.keys():
                sequence_number = tcp.seq
                ack_number = tcp.ack
                if sequence_number not in CURR_FLOW_.acks_seqs.keys():
                    CURR_FLOW_.acks_seqs.update({sequence_number: 1})
                    # Add a ACK that we are looking for
            else:
                sequence_number = tcp.seq
                ack_number = tcp.ack
                if ack_number in CURR_FLOW_.acks_seqs.keys():
                    CURR_FLOW_.acks_seqs[ack_number] -= 1
            if CURR_FLOW_.state == STATE.SECOND_TRANSACTION_SENT and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.IN_PROGRESS
            if CURR_FLOW_.state == STATE.FIRST_TRANSACTION_SENT and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.SECOND_TRANSACTION_SENT
                # This packet is sending the second transaction
                # print("SECOND TRANSACTION")
                # print(conn_key)
                sequence_number = tcp.seq
                ack_number = tcp.ack
                window_size = tcp.win
                # print("Sequence number:", sequence_number)
                # print("Ack number:", ack_number)
                # print("Receive Window size:", window_size)
                # print("-------------------------------------")
            if CURR_FLOW_.state == STATE.RECEIVED_FIN_ACK and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.ENDING
        if tcp.flags & dpkt.tcp.TH_FIN:
            CURR_FLOW_.finish_time = timestamp - time
            if CURR_FLOW_.state == STATE.IN_PROGRESS and conn_key in flows.keys():
                CURR_FLOW_.state = STATE.SENT_FIN
        if one_flow == None:
            one_flow = conn_key
        print(CURR_FLOW_.state)
        if conn_key in flows.keys() and CURR_FLOW_.state in transactions:
            CURR_FLOW_.packets.append(Packet(tcp.seq, tcp.ack))
        elif conn_key_reverse in flows.keys() and CURR_FLOW_.state in transactions:
            ack = tcp.ack
            curr_flow = flows[conn_key_reverse]
            idx = 0
            while idx < len(curr_flow.packets):
                if curr_flow.packets[idx].seq <= ack:
                    idx += 1
                else:
                    break
            curr_flow.packets = curr_flow.packets[idx:]

        # Maybe i should just do ACK and SEQ
        if conn_key in flows.keys():
            ack = tcp.ack
            seq = tcp.seq
            if seq in CURR_FLOW_.acks.keys():
                CURR_FLOW_.acks[seq] += 1
                if seq in CURR_FLOW_.seqs.keys() and  CURR_FLOW_.seqs[seq] > 1:
                    CURR_FLOW_.retransmits_trip += 1
                elif seq in CURR_FLOW_.seqs.keys() and CURR_FLOW_.seqs[seq] == 1:
                    CURR_FLOW_.retransmits_timeout += 1
            else:
                CURR_FLOW_.acks.update({seq: 1})
        elif conn_key_reverse in flows.keys():
            ack = tcp.ack
            seq = tcp.seq
            if ack in CURR_FLOW_.seqs.keys():
                CURR_FLOW_.seqs[ack] += 1
            else:
                CURR_FLOW_.seqs.update({ack: 1})
        # print(f"Protocol: {protocol}, Source IP: {src_ip}, Source Port: {src_port}, Destination IP: {dst_ip}, Destination Port: {dst_port}, Flags: {state}")
for flow_key in flows.keys():
    print("Connection: (src_ip, src_port, dest_ip, dest_port)")
    curr_flow = flows[flow_key]
    # print(curr_flow.packets)
    #for packet in curr_flow.packets:
    #    print(packet)
    sum = -1
    for key in curr_flow.acks.keys():
        val = curr_flow.acks[key]
        if val > 1:
            sum += 1
    print("Total Retransmissions: "+ str(sum))
    print("Triple Duplicate: " + str(curr_flow.retransmits_trip))
    print("Timeout: " + str(max(curr_flow.retransmits_timeout - 1, 0)))
    print("Throughput (bytes per second)")
    # print(flows[flow_key].get_throughput())
    print("--------------------------------")
