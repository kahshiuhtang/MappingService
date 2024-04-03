import dpkt
import socket
from enum import Enum

# class syntax

class STATE(Enum):
    LOADING = 0
    SENT_FIRST_SYN = 1
    SENT_SECOND_SYN = 2
    FIRST_TRANSACTION_SENT = 3
    SECOND_TRANSACTION_SENT = 4
    IN_PROGRESS = 5
    FINISHED = 6

class Packet:
    def __init__(self, conn_key, ip, tcp, start):
        self.conn = conn_key
        self.ip = ip
        self.tcp = tcp
        self.data_sent = 0
        self.starting_time = start
        self.finish_time = 0
        self.state = STATE.LOADING
        self.sequence = ()
        self.ack = ()
        self.r_window = ()
    def get_throughput(self):
        return self.data_sent / (self.finish_time - self.starting_time)
    def __str__(self):
        return f"Connection:{self.conn}, data sent:{self.data_sent}, start time: {self.starting_time}, thoughput:{self.get_throughput()}"

f= open('assignment2.pcap', 'rb')
pcap = dpkt.pcap.Reader(f)

flows = dict()
time = -1
for timestamp, buf in pcap:
    eth = dpkt.ethernet.Ethernet(buf)
    if time == -1:
        time = timestamp
    if isinstance(eth.data, dpkt.ip.IP):
        ip = eth.data
        src_ip = socket.inet_ntoa(ip.src)
        dst_ip = socket.inet_ntoa(ip.dst)
        packet_size = len(ip.data)
        print("Packet size:", packet_size)
        print(timestamp- time)
        if isinstance(ip.data, dpkt.tcp.TCP):
            tcp = ip.data
            src_port = tcp.sport
            dst_port = tcp.dport
            protocol = "TCP"
        conn_key = (src_ip, src_port, dst_ip, dst_port)
        conn_key_reverse = (dst_ip, dst_port, src_ip, src_port)
        curr_packet = Packet(conn_key, ip, ip.data, timestamp - time)
        if conn_key in flows.keys():
            curr_packet = flows[conn_key]
        elif conn_key_reverse in flows.keys():
            curr_packet = flows[conn_key_reverse]
        else:
            flows[conn_key] = curr_packet
        curr_packet.data_sent += packet_size
        state = ""
        if tcp.flags & dpkt.tcp.TH_SYN and tcp.flags & dpkt.tcp.TH_ACK:
            pass
        elif tcp.flags & dpkt.tcp.TH_FIN and tcp.flags & dpkt.tcp.TH_ACK:
            pass  # print("FIN_ACK_RECEIVED")
        elif tcp.flags & dpkt.tcp.TH_SYN:
            print("SYN_SENT")
        elif tcp.flags & dpkt.tcp.TH_FIN:
            print("FIN_SENT")
        elif tcp.flags & dpkt.tcp.TH_ACK:
            pass  #print("ACK")
        if tcp.flags & dpkt.tcp.TH_FIN:
            curr_packet.finish_time = timestamp - time
            print("FIN_SENT")

        # print(f"Protocol: {protocol}, Source IP: {src_ip}, Source Port: {src_port}, Destination IP: {dst_ip}, Destination Port: {dst_port}, Flags: {state}")
            
for key in flows.keys():
    print(str(flows[key]))