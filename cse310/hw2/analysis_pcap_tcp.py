import dpkt
import socket
from enum import Enum


class STATE(Enum):
    LOADING = 0
    SENT_FIRST_SYN = 1
    RECEIVED_SYN_ACK = 2
    SENT_SECOND_SYN = 3
    FIRST_TRANSACTION_SENT = 4
    SECOND_TRANSACTION_SENT = 5
    IN_PROGRESS = 6
    SENT_FIN = 7
    RECEIVED_FIN_ACK = 8
    ENDING = 9


class Flow:
    def __init__(self, conn_key, ip, tcp, start):
        self.conn = conn_key
        self.ip = ip
        self.tcp = tcp
        self.data_sent = 0
        self.starting_time = start
        self.finish_time = 0
        self.state = STATE.LOADING
        self.packets = []
        self.acks_seqs = dict()
        self.retransmits_timeout = 0
        self.retransmits_trip = 0

    def get_throughput(self):
        return self.data_sent / (self.finish_time - self.starting_time)

    def __str__(self):
        return f"Connection:{self.conn}, data sent:{self.data_sent}, start time: {self.starting_time}, thoughput:{self.get_throughput()}"


f = open('assignment2.pcap', 'rb')
pcap = dpkt.pcap.Reader(f)

flows = dict()
time = -1
PACKET_COUNT = 0
PACKET_CONTROL = 7
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
        curr_packet = Flow(conn_key, ip, ip.data, timestamp - time)
        if conn_key in flows.keys():
            curr_packet = flows[conn_key]
            curr_packet.data_sent += packet_size
        elif conn_key_reverse in flows.keys():
            curr_packet = flows[conn_key_reverse]
        else:
            curr_packet.data_sent += packet_size
            flows[conn_key] = curr_packet

        if tcp.flags & dpkt.tcp.TH_SYN and tcp.flags & dpkt.tcp.TH_ACK:
            if curr_packet.state == STATE.SENT_FIRST_SYN:
                curr_packet.state = STATE.RECEIVED_SYN_ACK
        elif tcp.flags & dpkt.tcp.TH_FIN and tcp.flags & dpkt.tcp.TH_ACK:
            if curr_packet.state == STATE.SENT_FIN:
                curr_packet.state = STATE.RECEIVED_FIN_ACK
        elif tcp.flags & dpkt.tcp.TH_SYN:
            if curr_packet.state == STATE.LOADING:
                curr_packet.state = STATE.SENT_FIRST_SYN
        elif tcp.flags & dpkt.tcp.TH_FIN:
            # Maybe the other person can initiate FIN?
            if curr_packet.state == STATE.IN_PROGRESS and conn_key in flows.keys():
                curr_packet.state = STATE.SENT_FIN
            print("FIN_SENT")
        elif tcp.flags & dpkt.tcp.TH_ACK:
            if curr_packet.state == STATE.RECEIVED_SYN_ACK:
                curr_packet.state = STATE.SENT_SECOND_SYN
            if curr_packet.state == STATE.SENT_SECOND_SYN and conn_key in flows.keys():
                curr_packet.state = STATE.FIRST_TRANSACTION_SENT
                # This packet is sending the first transaction
                print("FIRST TRANSACTION")
                print(conn_key)
                sequence_number = tcp.seq
                ack_number = tcp.ack
                window_size = tcp.win
                print("Sequence number:", sequence_number)
                print("Ack number:", ack_number)
                print("Receive Window size:", window_size)
                print("-------------------------------------")
            if curr_packet.state == STATE.FIRST_TRANSACTION_SENT and conn_key in flows.keys():
                curr_packet.state = STATE.SECOND_TRANSACTION_SENT
                # This packet is sending the second transaction
                print("SECOND TRANSACTION")
                print(conn_key)
                sequence_number = tcp.seq
                ack_number = tcp.ack
                window_size = tcp.win
                print("Sequence number:", sequence_number)
                print("Ack number:", ack_number)
                print("Receive Window size:", window_size)
                print("-------------------------------------")
            if curr_packet.state == STATE.SECOND_TRANSACTION_SENT and conn_key in flows.keys():
                curr_packet.state = STATE.IN_PROGRESS
            if curr_packet.state == STATE.RECEIVED_FIN_ACK and conn_key in flows.keys():
                curr_packet.state = STATE.ENDING
        if tcp.flags & dpkt.tcp.TH_FIN:
            curr_packet.finish_time = timestamp - time
            if curr_packet.state == STATE.IN_PROGRESS and conn_key in flows.keys():
                curr_packet.state = STATE.SENT_FIN

        # Want to check from sender to reciever
        # Want to see how many repeat we get
        if conn_key in flows.keys():
            ack_num =ip.data.ack
            seq_num = ip.data.seq
            print("ACK + Seq SENT")
            print(ack_num)
            print(seq_num)
            print("----------------------------")
        elif conn_key_reverse in flows.keys():
            ack_num =ip.data.ack
            seq_num = ip.data.seq
            print("ACK + Seq RECV")
            print(ack_num)
            print(seq_num)
            print("----------------------------")
        # print(f"Protocol: {protocol}, Source IP: {src_ip}, Source Port: {src_port}, Destination IP: {dst_ip}, Destination Port: {dst_port}, Flags: {state}")
for flow_key in flows.keys():
    print("Connection: (src_ip, src_port, dest_ip, dest_port)")
    print(flow_key)
    print("Throughput (bytes per second)")
    # print(flows[flow_key].get_throughput())
    print("--------------------------------")
