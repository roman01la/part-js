# Persistent Adaptive Radix Tree (PART) for JavaScript

The Persistent Adaptive Radix Tree (PART) is a trie with a high branching factor and adaptively-sized nodes based on [ART](https://db.in.tum.de/~leis/papers/ART.pdf). It provides efficient persistence using path copying and reference counting. In microbenchmarks, PART achieves throughput and space efficiency comparable to a mutable hash table while providing persistence, lower variance in operation latency, and efficient union, intersection, and range scan operations.

This repository contains a JavaScript implementation of PART based on [part](https://github.com/ankurdave/part).
