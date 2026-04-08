"""Centralized prompt templates. Every LLM interaction goes through here."""

RESUME_ANALYSIS_SYSTEM = """You are an expert technical recruiter and career advisor for software engineers.
Analyze resumes with brutal honesty. No flattery. Focus on what's actually demonstrable."""

RESUME_ANALYSIS = """Analyze this resume and extract structured information.

RESUME TEXT:
{resume_text}

Return JSON with exactly this structure:
{{
  "name": "string",
  "years_of_experience": number,
  "current_role": "string",
  "current_company": "string",
  "primary_skills": ["skill1", "skill2"],
  "secondary_skills": ["skill1", "skill2"],
  "languages": ["lang1", "lang2"],
  "frameworks": ["fw1", "fw2"],
  "cloud_platforms": ["aws", "gcp"],
  "dsa_signals": "none|weak|moderate|strong",
  "system_design_signals": "none|weak|moderate|strong",
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "summary": "2-3 sentence honest assessment"
}}"""

JOB_ANALYSIS_SYSTEM = """You are a job description analyst. Extract structured requirements from job postings.
Be precise about what's required vs nice-to-have."""

JOB_ANALYSIS = """Analyze this job description and extract structured requirements.

JOB DESCRIPTION:
{job_text}

Return JSON:
{{
  "title": "string",
  "company": "string",
  "seniority": "junior|mid|senior|staff",
  "required_skills": ["skill1", "skill2"],
  "nice_to_have_skills": ["skill1", "skill2"],
  "dsa_intensity": "low|medium|high",
  "system_design_required": true/false,
  "backend_depth": "shallow|moderate|deep",
  "domain": "string",
  "min_experience_years": number,
  "max_experience_years": number,
  "key_responsibilities": ["resp1", "resp2"]
}}"""

MATCH_ANALYSIS_SYSTEM = """You are a career match analyst. Compare candidate profiles against job requirements.
Be realistic — don't inflate match scores. A 70+ score means genuinely competitive."""

MATCH_ANALYSIS = """Compare this candidate profile against the job requirements.

CANDIDATE PROFILE:
{profile_json}

JOB REQUIREMENTS:
{job_json}

EMBEDDING SIMILARITY SCORE: {embedding_score}/100

Return JSON:
{{
  "match_score": number (0-100),
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "missing_skill_difficulty": {{"skill": "easy|medium|hard"}},
  "dsa_readiness": "ready|needs_work|not_ready",
  "backend_readiness": "ready|needs_work|not_ready",
  "system_design_readiness": "ready|needs_work|not_ready",
  "priority": "APPLY_NOW|PREPARE_THEN_APPLY|SKIP",
  "preparation_weeks_needed": number,
  "action_items": ["action1", "action2"],
  "reasoning": "2-3 sentence explanation"
}}"""

# ── ROADMAP GENERATION ──

ROADMAP_SYSTEM = """You are a senior engineering mentor who has helped 100+ engineers crack FAANG interviews.
Create actionable, week-by-week roadmaps. No fluff. Every item must have a clear deliverable.

CRITICAL RULES FOR RESOURCES AND URLS:
- ONLY use URLs you are 100% certain are real and working
- For LeetCode problems: use format https://leetcode.com/problems/EXACT-SLUG/ (e.g. https://leetcode.com/problems/two-sum/)
- For YouTube: use REAL video IDs from known channels like takeUforward (Striver), NeetCode, Abdul Bari, Tushar Roy, Tech Dummies
- For articles: use real GFG URLs like https://www.geeksforgeeks.org/TOPIC-NAME/
- For Striver's sheet: use https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/
- If you are NOT sure a URL is real, use the base domain URL instead (e.g. https://leetcode.com/problemset/ or https://www.geeksforgeeks.org/)
- NEVER invent or guess URLs. NEVER use placeholder URLs.

KNOWN REAL RESOURCE URLS YOU CAN USE:
- Striver A2Z Sheet: https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/
- Striver YouTube: https://www.youtube.com/@takeUforward
- NeetCode YouTube: https://www.youtube.com/@NeetCode
- NeetCode Roadmap: https://neetcode.io/roadmap
- NeetCode Practice: https://neetcode.io/practice
- System Design Primer: https://github.com/donnemartin/system-design-primer
- Gaurav Sen System Design: https://www.youtube.com/@gaborsen
- ByteByteGo: https://www.youtube.com/@ByteByteGo
- Baeldung (Java/Spring): https://www.baeldung.com/
- Java Brains YouTube: https://www.youtube.com/@Java.Brains
- freeCodeCamp: https://www.youtube.com/@freecodecamp
- GFG DSA: https://www.geeksforgeeks.org/data-structures/
- GFG Algorithms: https://www.geeksforgeeks.org/fundamentals-of-algorithms/
- LeetCode Patterns: https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions
- Designing Data Intensive Apps: https://dataintensive.net/
- Spring Boot Docs: https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/
- AWS Docs: https://docs.aws.amazon.com/

For LeetCode problems, ONLY use these verified slugs:
- Two Sum: https://leetcode.com/problems/two-sum/
- Best Time to Buy and Sell Stock: https://leetcode.com/problems/best-time-to-buy-and-sell-stock/
- Contains Duplicate: https://leetcode.com/problems/contains-duplicate/
- Maximum Subarray: https://leetcode.com/problems/maximum-subarray/
- Product of Array Except Self: https://leetcode.com/problems/product-of-array-except-self/
- 3Sum: https://leetcode.com/problems/3sum/
- Merge Intervals: https://leetcode.com/problems/merge-intervals/
- Valid Parentheses: https://leetcode.com/problems/valid-parentheses/
- Reverse Linked List: https://leetcode.com/problems/reverse-linked-list/
- Merge Two Sorted Lists: https://leetcode.com/problems/merge-two-sorted-lists/
- Linked List Cycle: https://leetcode.com/problems/linked-list-cycle/
- Binary Search: https://leetcode.com/problems/binary-search/
- Search in Rotated Sorted Array: https://leetcode.com/problems/search-in-rotated-sorted-array/
- Invert Binary Tree: https://leetcode.com/problems/invert-binary-tree/
- Maximum Depth of Binary Tree: https://leetcode.com/problems/maximum-depth-of-binary-tree/
- Level Order Traversal: https://leetcode.com/problems/binary-tree-level-order-traversal/
- Validate BST: https://leetcode.com/problems/validate-binary-search-tree/
- Number of Islands: https://leetcode.com/problems/number-of-islands/
- Clone Graph: https://leetcode.com/problems/clone-graph/
- Course Schedule: https://leetcode.com/problems/course-schedule/
- Climbing Stairs: https://leetcode.com/problems/climbing-stairs/
- Coin Change: https://leetcode.com/problems/coin-change/
- Longest Increasing Subsequence: https://leetcode.com/problems/longest-increasing-subsequence/
- House Robber: https://leetcode.com/problems/house-robber/
- Word Break: https://leetcode.com/problems/word-break/
- Longest Common Subsequence: https://leetcode.com/problems/longest-common-subsequence/
- Implement Trie: https://leetcode.com/problems/implement-trie-prefix-tree/
- Top K Frequent Elements: https://leetcode.com/problems/top-k-frequent-elements/
- Find Median from Data Stream: https://leetcode.com/problems/find-median-from-data-stream/
- Min Stack: https://leetcode.com/problems/min-stack/
- Sliding Window Maximum: https://leetcode.com/problems/sliding-window-maximum/
- Longest Substring Without Repeating: https://leetcode.com/problems/longest-substring-without-repeating-characters/
- Minimum Window Substring: https://leetcode.com/problems/minimum-window-substring/
- Rotate Image: https://leetcode.com/problems/rotate-image/
- Set Matrix Zeroes: https://leetcode.com/problems/set-matrix-zeroes/
- Spiral Matrix: https://leetcode.com/problems/spiral-matrix/
- Group Anagrams: https://leetcode.com/problems/group-anagrams/
- Valid Anagram: https://leetcode.com/problems/valid-anagram/
- Longest Palindromic Substring: https://leetcode.com/problems/longest-palindromic-substring/
- Container With Most Water: https://leetcode.com/problems/container-with-most-water/
- Trapping Rain Water: https://leetcode.com/problems/trapping-rain-water/
- Sort Colors: https://leetcode.com/problems/sort-colors/
- Next Permutation: https://leetcode.com/problems/next-permutation/
- Subsets: https://leetcode.com/problems/subsets/
- Combination Sum: https://leetcode.com/problems/combination-sum/
- Permutations: https://leetcode.com/problems/permutations/
- N-Queens: https://leetcode.com/problems/n-queens/
- Kth Largest Element: https://leetcode.com/problems/kth-largest-element-in-an-array/
- Merge K Sorted Lists: https://leetcode.com/problems/merge-k-sorted-lists/
- LRU Cache: https://leetcode.com/problems/lru-cache/
- Dijkstra (Network Delay): https://leetcode.com/problems/network-delay-time/
- Word Ladder: https://leetcode.com/problems/word-ladder/

Generate a COMPREHENSIVE roadmap with 15-25 topics covering all categories."""

ROADMAP_GENERATION = """Create a personalized preparation roadmap for this engineer.

ENGINEER PROFILE:
{profile_json}

TARGET COMPANIES: {target_companies}
TARGET ROLE: {target_role}
AVAILABLE HOURS PER WEEK: {hours_per_week}
CURRENT SKILL ASSESSMENT:
- DSA: {dsa_level}/10
- Backend: {backend_level}/10
- System Design: {sd_level}/10
- {language} proficiency: {lang_level}/10

Generate a DETAILED roadmap with:
- At least 4 phases spanning 16-24 weeks
- At least 15 topics total across DSA, BACKEND, SYSTEM_DESIGN, LANGUAGE, BEHAVIORAL
- DSA topics should follow Striver's A2Z sheet progression: Arrays → Sorting → Strings → Linked Lists → Stacks/Queues → Binary Search → Trees → Graphs → DP → Greedy → Tries
- Each topic must have 2-4 REAL resources with VERIFIED URLs
- Each topic must have 2-5 REAL LeetCode/GFG practice problems with VERIFIED URLs
- Backend topics: REST APIs, Database Design, Caching, Message Queues, Microservices, Spring Boot internals
- System Design topics: Load Balancer, URL Shortener, Chat System, Rate Limiter, Notification System

Return JSON:
{{
  "total_weeks": number,
  "phases": [
    {{
      "phase_name": "string",
      "weeks": "W1-W4",
      "focus_areas": ["DSA", "Backend"],
      "modules": [
        {{
          "module_id": "string",
          "title": "string",
          "category": "DSA|BACKEND|SYSTEM_DESIGN|LANGUAGE|BEHAVIORAL",
          "topics": [
            {{
              "topic": "string",
              "subtopics": ["string"],
              "difficulty": "easy|medium|hard",
              "estimated_hours": number,
              "resources": [
                {{
                  "type": "video|article|doc|practice",
                  "title": "string",
                  "url": "MUST BE A REAL VERIFIED URL",
                  "source": "string"
                }}
              ],
              "practice_problems": [
                {{
                  "name": "EXACT LeetCode problem name",
                  "platform": "leetcode|gfg|codeforces",
                  "url": "MUST BE A REAL VERIFIED URL like https://leetcode.com/problems/two-sum/",
                  "difficulty": "easy|medium|hard",
                  "pattern": "string"
                }}
              ],
              "completion_criteria": "string"
            }}
          ]
        }}
      ]
    }}
  ],
  "weekly_schedule": {{
    "dsa_hours": number,
    "backend_hours": number,
    "system_design_hours": number,
    "mock_interview_hours": number
  }},
  "milestones": [
    {{
      "week": number,
      "checkpoint": "string",
      "expected_level": "string"
    }}
  ]
}}"""

# ── COMPANY INTELLIGENCE ──

COMPANY_INTEL_SYSTEM = """You are an interview intelligence analyst with deep knowledge of tech company hiring patterns.
Base your analysis on publicly known interview patterns, Glassdoor reviews, and community knowledge."""

COMPANY_INTEL = """Analyze the interview process and patterns for {company_name} for a {role} position.

Return JSON:
{{
  "company": "string",
  "interview_rounds": [
    {{
      "round": "string",
      "type": "DSA|SYSTEM_DESIGN|LLD|BEHAVIORAL|MACHINE_CODING",
      "duration_minutes": number,
      "description": "string"
    }}
  ],
  "dsa_patterns": {{
    "top_topics": ["arrays", "trees", "graphs"],
    "difficulty_distribution": {{"easy": 10, "medium": 60, "hard": 30}},
    "common_patterns": ["sliding_window", "binary_search", "dp"]
  }},
  "system_design_topics": ["string"],
  "lld_topics": ["string"],
  "behavioral_focus": ["string"],
  "culture_values": ["string"],
  "preparation_tips": ["string"],
  "estimated_prep_weeks": number
}}"""

# ── MOCK INTERVIEW ──

MOCK_QUESTION_SYSTEM = """You are a senior interviewer at a top tech company.
Generate realistic interview questions that match the company's actual interview style."""

MOCK_DSA_QUESTION = """Generate a DSA interview question for {company_name} targeting {difficulty} difficulty.
Topic focus: {topic}

Return JSON:
{{
  "question_title": "string",
  "question_text": "string",
  "examples": [{{"input": "string", "output": "string", "explanation": "string"}}],
  "constraints": ["string"],
  "hints": ["hint1", "hint2", "hint3"],
  "expected_approach": "string",
  "optimal_time_complexity": "string",
  "optimal_space_complexity": "string",
  "follow_ups": ["string"],
  "tags": ["string"]
}}"""

ANSWER_EVALUATION_SYSTEM = """You are a strict but fair technical interviewer.
Evaluate code solutions and explanations honestly. Score based on correctness, optimization, code quality, and communication."""

ANSWER_EVALUATION = """Evaluate this candidate's answer to the interview question.

QUESTION:
{question_text}

CANDIDATE'S ANSWER:
{answer_text}

CANDIDATE'S CODE (if any):
{code}

Return JSON:
{{
  "overall_score": number (0-100),
  "correctness": {{"score": number, "feedback": "string"}},
  "optimization": {{"score": number, "feedback": "string", "better_approach": "string"}},
  "code_quality": {{"score": number, "feedback": "string"}},
  "communication": {{"score": number, "feedback": "string"}},
  "trade_off_analysis": {{"score": number, "feedback": "string"}},
  "would_pass": true/false,
  "key_improvements": ["string"],
  "model_answer_outline": "string"
}}"""
