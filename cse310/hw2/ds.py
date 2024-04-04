import heapq
from enum import Enum

class Comp:
    def __init__(self, val):
        self.val = val

    def __lt__(self, other):
        self_val = self.val.seq
        other_val = other.seq
        return self_val < other_val


class MinHeap:
    def __init__(self):
        self.heap = []

    def push(self, val):
        heapq.heappush(self.heap, Comp(val))

    def pop(self):
        return heapq.heappop(self.heap).val

    def peek(self):
        return self.heap[0].val if self.heap else None

    def __len__(self):
        return len(self.heap)


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


class Packet:

    def __init__(self, seq, ack):
        self.seq = seq
        self.ack = ack
    
    def __str__(self):
        return f"SEQ:{self.seq}, ACK:{self.ack}"


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
        self.curr_seq = 0
        self.acks = dict() # Map the responses you get to how many times you get them
        self.seqs = dict() # Map the requests you send out and how many times
        self.retransmits_timeout = 0
        self.retransmits_trip = 0

        self.max_packets_out = 0
        self.window = []
        self.current_rtt = -1
        self.baseline = -1
        self.printed = 0

        

    def get_throughput(self):
        return self.data_sent / (self.finish_time - self.starting_time)

    def __str__(self):
        return f"Connection:{self.conn}, data sent:{self.data_sent}, start time: {self.starting_time}, thoughput:{self.get_throughput()}"
    

