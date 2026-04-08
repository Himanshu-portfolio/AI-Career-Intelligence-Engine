# Continuation of ROADMAP_DATABASE
# This file should be imported AFTER roadmap_db.py

ROADMAP_DATABASE_PART2 = {
    "BACKEND": [
        {
            "topic": "REST APIs & HTTP",
            "subtopics": ["HTTP Methods", "Status Codes", "REST Principles", "API Design"],
            "difficulty": "medium",
            "estimated_hours": 6,
            "resources": [
                {"type": "article", "title": "REST API Design - Baeldung", "url": "https://www.baeldung.com/rest-api-best-practices", "source": "Baeldung"},
                {"type": "video", "title": "REST APIs - Java Brains", "url": "https://www.youtube.com/watch?v=llF6vD-ElDI", "source": "Java Brains"},
                {"type": "doc", "title": "HTTP Status Codes", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status", "source": "MDN"},
            ],
            "practice_problems": [
                {"name": "Design a URL Shortener", "platform": "leetcode", "url": "https://leetcode.com/problems/design-tinyurl/", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Database Design & SQL",
            "subtopics": ["Relational Databases", "Normalization", "Indexing", "Query Optimization"],
            "difficulty": "medium",
            "estimated_hours": 8,
            "resources": [
                {"type": "article", "title": "SQL Basics - Baeldung", "url": "https://www.baeldung.com/sql", "source": "Baeldung"},
                {"type": "video", "title": "Database Design - Gaurav Sen", "url": "https://www.youtube.com/watch?v=ztHopE4Tig0", "source": "Gaurav Sen"},
                {"type": "doc", "title": "PostgreSQL Docs", "url": "https://www.postgresql.org/docs/", "source": "PostgreSQL"},
            ],
            "practice_problems": [
                {"name": "Design a Database", "platform": "leetcode", "url": "https://leetcode.com/problems/design-a-database/", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Spring Boot Fundamentals",
            "subtopics": ["Dependency Injection", "Annotations", "Controllers", "Services"],
            "difficulty": "medium",
            "estimated_hours": 8,
            "resources": [
                {"type": "article", "title": "Spring Boot Guide - Baeldung", "url": "https://www.baeldung.com/spring-boot", "source": "Baeldung"},
                {"type": "doc", "title": "Spring Boot Official Docs", "url": "https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/", "source": "Spring"},
                {"type": "video", "title": "Spring Boot Tutorial - Java Brains", "url": "https://www.youtube.com/watch?v=35EQXmHKZYs", "source": "Java Brains"},
            ],
            "practice_problems": [
                {"name": "Build a REST API", "platform": "github", "url": "https://github.com/topics/spring-boot-rest-api", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Caching & Redis",
            "subtopics": ["Cache Strategies", "Redis Data Types", "TTL", "Cache Invalidation"],
            "difficulty": "medium",
            "estimated_hours": 6,
            "resources": [
                {"type": "article", "title": "Redis Guide - Baeldung", "url": "https://www.baeldung.com/spring-data-redis", "source": "Baeldung"},
                {"type": "video", "title": "Redis Tutorial - ByteByteGo", "url": "https://www.youtube.com/watch?v=a4yX3aRUTL8", "source": "ByteByteGo"},
                {"type": "doc", "title": "Redis Official Docs", "url": "https://redis.io/documentation", "source": "Redis"},
            ],
            "practice_problems": [
                {"name": "LRU Cache", "platform": "leetcode", "url": "https://leetcode.com/problems/lru-cache/", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Message Queues & Async Processing",
            "subtopics": ["RabbitMQ", "Kafka", "Event-Driven Architecture"],
            "difficulty": "hard",
            "estimated_hours": 8,
            "resources": [
                {"type": "article", "title": "Message Queues - Baeldung", "url": "https://www.baeldung.com/spring-amqp", "source": "Baeldung"},
                {"type": "video", "title": "Kafka Tutorial - ByteByteGo", "url": "https://www.youtube.com/watch?v=JalUUbo1yks", "source": "ByteByteGo"},
            ],
            "practice_problems": [
                {"name": "Design Event-Driven System", "platform": "github", "url": "https://github.com/topics/event-driven-architecture", "difficulty": "hard"},
            ]
        },
        {
            "topic": "Microservices Architecture",
            "subtopics": ["Service Discovery", "API Gateway", "Circuit Breaker", "Distributed Tracing"],
            "difficulty": "hard",
            "estimated_hours": 10,
            "resources": [
                {"type": "article", "title": "Microservices - Baeldung", "url": "https://www.baeldung.com/spring-cloud-series", "source": "Baeldung"},
                {"type": "video", "title": "Microservices Design - Gaurav Sen", "url": "https://www.youtube.com/watch?v=mPB2CgR3BYQ", "source": "Gaurav Sen"},
            ],
            "practice_problems": [
                {"name": "Design Microservices", "platform": "github", "url": "https://github.com/topics/microservices", "difficulty": "hard"},
            ]
        },
    ],
    "SYSTEM_DESIGN": [
        {
            "topic": "System Design Fundamentals",
            "subtopics": ["Scalability", "Availability", "Consistency", "CAP Theorem"],
            "difficulty": "hard",
            "estimated_hours": 8,
            "resources": [
                {"type": "video", "title": "System Design Basics - Gaurav Sen", "url": "https://www.youtube.com/watch?v=xpDnVSmNFwY", "source": "Gaurav Sen"},
                {"type": "article", "title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "source": "GitHub"},
                {"type": "video", "title": "System Design - ByteByteGo", "url": "https://www.youtube.com/watch?v=ZgdS0EF3wFY", "source": "ByteByteGo"},
            ],
            "practice_problems": [
                {"name": "Design a System", "platform": "github", "url": "https://github.com/donnemartin/system-design-primer", "difficulty": "hard"},
            ]
        },
        {
            "topic": "Load Balancing & Scaling",
            "subtopics": ["Load Balancer Types", "Horizontal Scaling", "Vertical Scaling"],
            "difficulty": "hard",
            "estimated_hours": 6,
            "resources": [
                {"type": "video", "title": "Load Balancing - Gaurav Sen", "url": "https://www.youtube.com/watch?v=galcDo_DS8Q", "source": "Gaurav Sen"},
                {"type": "article", "title": "Load Balancing - ByteByteGo", "url": "https://www.youtube.com/watch?v=K0Ta65OqQkY", "source": "ByteByteGo"},
            ],
            "practice_problems": [
                {"name": "Design Load Balancer", "platform": "github", "url": "https://github.com/topics/load-balancer", "difficulty": "hard"},
            ]
        },
        {
            "topic": "Database Sharding & Replication",
            "subtopics": ["Sharding Strategies", "Master-Slave Replication", "Consistency"],
            "difficulty": "hard",
            "estimated_hours": 8,
            "resources": [
                {"type": "video", "title": "Database Sharding - Gaurav Sen", "url": "https://www.youtube.com/watch?v=5g1EfAuGg4I", "source": "Gaurav Sen"},
                {"type": "article", "title": "Database Replication - ByteByteGo", "url": "https://www.youtube.com/watch?v=mPB2CgR3BYQ", "source": "ByteByteGo"},
            ],
            "practice_problems": [
                {"name": "Design Distributed Database", "platform": "github", "url": "https://github.com/topics/distributed-database", "difficulty": "hard"},
            ]
        },
        {
            "topic": "Caching Strategies",
            "subtopics": ["Cache Invalidation", "Cache Warming", "CDN"],
            "difficulty": "hard",
            "estimated_hours": 6,
            "resources": [
                {"type": "video", "title": "Caching - Gaurav Sen", "url": "https://www.youtube.com/watch?v=0uQqmwVUFGM", "source": "Gaurav Sen"},
                {"type": "article", "title": "Cache Invalidation - ByteByteGo", "url": "https://www.youtube.com/watch?v=K0Ta65OqQkY", "source": "ByteByteGo"},
            ],
            "practice_problems": [
                {"name": "Design Cache System", "platform": "github", "url": "https://github.com/topics/caching", "difficulty": "hard"},
            ]
        },
        {
            "topic": "Rate Limiting & Throttling",
            "subtopics": ["Token Bucket", "Sliding Window", "Distributed Rate Limiting"],
            "difficulty": "hard",
            "estimated_hours": 5,
            "resources": [
                {"type": "video", "title": "Rate Limiting - Gaurav Sen", "url": "https://www.youtube.com/watch?v=FU4WlwfS3G0", "source": "Gaurav Sen"},
                {"type": "article", "title": "Rate Limiting Algorithms", "url": "https://en.wikipedia.org/wiki/Rate_limiting", "source": "Wikipedia"},
            ],
            "practice_problems": [
                {"name": "Design Rate Limiter", "platform": "leetcode", "url": "https://leetcode.com/problems/design-hit-counter/", "difficulty": "medium"},
            ]
        },
    ],
    "LANGUAGE": [
        {
            "topic": "Java Basics & OOP",
            "subtopics": ["Variables", "Data Types", "Classes", "Inheritance", "Polymorphism"],
            "difficulty": "easy",
            "estimated_hours": 8,
            "resources": [
                {"type": "doc", "title": "Java Documentation", "url": "https://docs.oracle.com/javase/tutorial/", "source": "Oracle"},
                {"type": "video", "title": "Java Basics - Java Brains", "url": "https://www.youtube.com/watch?v=grPchWQl4Ro", "source": "Java Brains"},
                {"type": "article", "title": "Java OOP - Baeldung", "url": "https://www.baeldung.com/java-oop", "source": "Baeldung"},
            ],
            "practice_problems": [
                {"name": "Java Basics Problems", "platform": "leetcode", "url": "https://leetcode.com/problems/", "difficulty": "easy"},
            ]
        },
        {
            "topic": "Java Collections & Generics",
            "subtopics": ["List", "Set", "Map", "Generics", "Streams"],
            "difficulty": "medium",
            "estimated_hours": 8,
            "resources": [
                {"type": "article", "title": "Java Collections - Baeldung", "url": "https://www.baeldung.com/java-collections", "source": "Baeldung"},
                {"type": "video", "title": "Collections - Java Brains", "url": "https://www.youtube.com/watch?v=V8Ky2DsVV4I", "source": "Java Brains"},
                {"type": "doc", "title": "Collections API", "url": "https://docs.oracle.com/javase/tutorial/collections/", "source": "Oracle"},
            ],
            "practice_problems": [
                {"name": "Collections Problems", "platform": "leetcode", "url": "https://leetcode.com/problems/", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Multithreading & Concurrency",
            "subtopics": ["Threads", "Synchronization", "Locks", "Concurrent Collections"],
            "difficulty": "hard",
            "estimated_hours": 10,
            "resources": [
                {"type": "article", "title": "Java Concurrency - Baeldung", "url": "https://www.baeldung.com/java-concurrency", "source": "Baeldung"},
                {"type": "video", "title": "Multithreading - Java Brains", "url": "https://www.youtube.com/watch?v=r_MbozD32eo", "source": "Java Brains"},
            ],
            "practice_problems": [
                {"name": "Concurrency Problems", "platform": "leetcode", "url": "https://leetcode.com/problems/", "difficulty": "hard"},
            ]
        },
    ],
    "BEHAVIORAL": [
        {
            "topic": "Communication & Collaboration",
            "subtopics": ["Explaining Technical Concepts", "Asking Questions", "Teamwork"],
            "difficulty": "medium",
            "estimated_hours": 4,
            "resources": [
                {"type": "article", "title": "Communication Skills", "url": "https://www.indeed.com/career-advice/career-development/communication-skills", "source": "Indeed"},
                {"type": "video", "title": "Behavioral Interview Tips", "url": "https://www.youtube.com/watch?v=PJKYqLP6M1E", "source": "YouTube"},
            ],
            "practice_problems": [
                {"name": "Practice STAR Method", "platform": "github", "url": "https://github.com/topics/behavioral-interview", "difficulty": "medium"},
            ]
        },
        {
            "topic": "Problem Solving & Approach",
            "subtopics": ["Breaking Down Problems", "Trade-offs", "Optimization"],
            "difficulty": "medium",
            "estimated_hours": 4,
            "resources": [
                {"type": "article", "title": "Problem Solving Approach", "url": "https://www.geeksforgeeks.org/how-to-approach-a-problem/", "source": "GFG"},
                {"type": "video", "title": "Interview Problem Solving", "url": "https://www.youtube.com/watch?v=PJKYqLP6M1E", "source": "YouTube"},
            ],
            "practice_problems": [
                {"name": "Mock Interviews", "platform": "pramp", "url": "https://www.pramp.com/", "difficulty": "medium"},
            ]
        },
    ],
}
