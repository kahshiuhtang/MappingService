import dpkt
from collections import defaultdict


def calculate_fast_retransmissions(pcap_file):
    fast_retransmissions = defaultdict(int)

    with open(pcap_file, 'rb') as f:
        pcap = dpkt.pcap.Reader(f)

        # Dictionary to keep track of the last seen sequence number for each connection
        last_seq = defaultdict(int)

        for ts, buf in pcap:
            eth = dpkt.ethernet.Ethernet(buf)

            if isinstance(eth.data, dpkt.ip.IP):
                ip = eth.data
                if isinstance(ip.data, dpkt.tcp.TCP):
                    tcp = ip.data
                    src = '{}:{}'.format(ip.src, tcp.sport)
                    dst = '{}:{}'.format(ip.dst, tcp.dport)
                    seq = tcp.seq

                    if src not in last_seq:
                        last_seq[src] = seq
                    elif dst not in last_seq:
                        last_seq[dst] = seq
                    else:
                        if seq < last_seq[src] or seq < last_seq[dst]:
                            fast_retransmissions[(src, dst)] += 1
                        else:
                            last_seq[src] = max(last_seq[src], seq)
                            last_seq[dst] = max(last_seq[dst], seq)

    return fast_retransmissions


# Example usage:
pcap_file = 'assignment2.pcap'
fast_retransmissions = calculate_fast_retransmissions(pcap_file)
print("Fast Retransmissions:")
for connection, count in fast_retransmissions.items():
    print(f"Connection: {connection}, Count: {count}")
