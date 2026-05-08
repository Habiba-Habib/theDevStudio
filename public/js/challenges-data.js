const CHALLENGES_DATA = [
    {
        id: 1,
        title: 'Two Sum Problem',
        difficulty: 'Easy',
        points: 50,
        category: 'Algorithms',
        timeLimit: '45 minutes',
        desc: 'Given an array of integers, return indices of two numbers that add up to a target.',
        description: `Given an array of integers <span class="highlight-green">nums</span> 
        and an integer <span class="highlight-yellow">target</span>, return indices of the two numbers such that they add up to target.`,
        details: [
            'Each input has exactly one solution.',
            'Do not use the same element twice.',
            'Order does not matter.'
        ],
        examples: [
            { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 9' },
            { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] = 6' }
        ],
        defaultCode: `function twoSum(nums, target) {\n    // write your solution here\n}`,
        stats: { totalSubmissions: 12453, accepted: 6891, successRate: '55.3%' }
    },
    {
        id: 2,
        title: 'Build a REST API',
        difficulty: 'Medium',
        points: 150,
        category: 'Backend',
        timeLimit: '90 minutes',
        desc: 'Create a RESTful API with CRUD operations using Node.js and Express.',
        description: `Build a <span class="highlight-green">RESTful API</span> that supports 
        <span class="highlight-yellow">CRUD operations</span> using Node.js and Express.`,
        details: [
            'Implement GET, POST, PUT, DELETE routes.',
            'Use proper HTTP status codes.',
            'Validate request data.'
        ],
        examples: [
            { input: 'GET /users', output: '[{id:1, name:"John"}]', explanation: 'Returns all users' },
            { input: 'POST /users', output: '{id:2, name:"Jane"}', explanation: 'Creates a new user' }
        ],
        defaultCode: `const express = require('express');\nconst app = express();\n\n// write your solution here`,
        stats: { totalSubmissions: 8320, accepted: 3900, successRate: '46.8%' }
    },
    {
        id: 3,
        title: 'Implement Binary Search Tree',
        difficulty: 'Hard',
        points: 300,
        category: 'Data Structures',
        timeLimit: '120 minutes',
        desc: 'Implement a binary search tree with insert, delete, and search operations.',
        description: `Implement a <span class="highlight-green">Binary Search Tree</span> class 
        with <span class="highlight-yellow">insert</span>, delete, and search methods.`,
        details: [
            'Implement insert, delete, and search methods.',
            'Handle edge cases like empty tree.',
            'Maintain BST properties after every operation.'
        ],
        examples: [
            { input: 'insert(5), insert(3), insert(7)', output: 'Tree with root 5', explanation: '3 goes left, 7 goes right' },
            { input: 'search(3)', output: 'true', explanation: '3 exists in the tree' }
        ],
        defaultCode: `class BST {\n    constructor() {\n        this.root = null;\n    }\n    // write your solution here\n}`,
        stats: { totalSubmissions: 5100, accepted: 1800, successRate: '35.2%' }
    },
    {
        id: 4,
        title: 'CSS Grid Layout',
        difficulty: 'Easy',
        points: 75,
        category: 'Frontend',
        timeLimit: '45 minutes',
        desc: 'Create a responsive dashboard layout using CSS Grid.',
        description: `Create a responsive dashboard using <span class="highlight-green">CSS Grid</span>.`,
        details: [
            'Use grid-template-columns and rows.',
            'Make it responsive with media queries.',
            'Include at least 3 sections.'
        ],
        examples: [
            { input: '3 column layout', output: 'Responsive grid', explanation: 'Collapses to 1 column on mobile' }
        ],
        defaultCode: `/* write your CSS Grid solution here */`,
        stats: { totalSubmissions: 344, accepted: 210, successRate: '61.0%' }
    },
    {
        id: 5,
        title: 'React Component Lifecycle',
        difficulty: 'Medium',
        points: 125,
        category: 'Frontend',
        timeLimit: '60 minutes',
        desc: 'Build a React component demonstrating all lifecycle methods and hooks.',
        description: `Build a <span class="highlight-green">React component</span> that demonstrates 
        <span class="highlight-yellow">lifecycle methods</span> and hooks.`,
        details: [
            'Use useState and useEffect.',
            'Demonstrate component mount and unmount.',
            'Handle cleanup in useEffect.'
        ],
        examples: [
            { input: 'Component mounts', output: 'Console logs lifecycle', explanation: 'useEffect fires on mount' }
        ],
        defaultCode: `function MyComponent() {\n    // write your solution here\n}`,
        stats: { totalSubmissions: 3064, accepted: 1500, successRate: '48.9%' }
    },
    {
        id: 6,
        title: 'Dynamic Programming: Knapsack',
        difficulty: 'Hard',
        points: 350,
        category: 'Algorithms',
        timeLimit: '120 minutes',
        desc: 'Solve the 0/1 knapsack problem using dynamic programming.',
        description: `Solve the <span class="highlight-green">0/1 Knapsack</span> problem using 
        <span class="highlight-yellow">dynamic programming</span>.`,
        details: [
            'Use a 2D DP table.',
            'Optimize for space if possible.',
            'Handle edge cases like empty items.'
        ],
        examples: [
            { input: 'weights=[1,2,3], values=[6,10,12], capacity=5', output: '22', explanation: 'Take items 2 and 3' }
        ],
        defaultCode: `function knapsack(weights, values, capacity) {\n    // write your solution here\n}`,
        stats: { totalSubmissions: 1705, accepted: 600, successRate: '35.2%' }
    }
];


function initChallenges() {
    const stored = localStorage.getItem('challenges');
    if (!stored) {
        localStorage.setItem('challenges', JSON.stringify(CHALLENGES_DATA));
    }
}


function getChallenges() {
    const stored = localStorage.getItem('challenges');
    return stored ? JSON.parse(stored) : CHALLENGES_DATA;
}


function addChallenge(challenge) {
    const challenges = getChallenges();
    const newId = challenges.length > 0
        ? Math.max(...challenges.map(c => c.id)) + 1
        : 1;

    const newChallenge = {
        id: newId,
        ...challenge,
        stats: { totalSubmissions: 0, accepted: 0, successRate: '0%' }
    };

    challenges.push(newChallenge);
    localStorage.setItem('challenges', JSON.stringify(challenges));
    return newChallenge;
}


function deleteChallenge(id) {
    const challenges = getChallenges().filter(c => c.id !== id);
    localStorage.setItem('challenges', JSON.stringify(challenges));
}


initChallenges();