// Teacher code to name mapping
const teacherMap = {
    'MGK': 'Mohammad Golam Kibria',
    // Add more teacher mappings as needed
    // Format: 'CODE': 'Full Name'
};

// Schedule data
const scheduleData = [
    {
        courseId: 'CSE3202',
        courseName: 'Artificial Intelligence & Machine Learning Lab',
        section: '2',
        day: 'TUE',
        time: '8:00 AM - 9:20 AM',
        room: 'PB103',
        teacherCode: null // Will be extracted from Google Sheets
    },
    {
        courseId: 'CSE3202',
        courseName: 'Artificial Intelligence & Machine Learning Lab',
        section: '2',
        day: 'TUE',
        time: '9:25 AM - 10:45 AM',
        room: 'PB103',
        teacherCode: null
    },
    {
        courseId: 'CSE4418',
        courseName: 'Internet of Things Lab',
        section: '1',
        day: 'SUN',
        time: '8:00 AM - 9:20 AM',
        room: 'PB104',
        teacherCode: null
    },
    {
        courseId: 'CSE4418',
        courseName: 'Internet of Things Lab',
        section: '1',
        day: 'SUN',
        time: '9:25 AM - 10:45 AM',
        room: 'PB104',
        teacherCode: null
    },
    {
        courseId: 'CSE4419',
        courseName: 'Network Security',
        section: '1',
        day: 'THU',
        time: '4:30 PM - 5:50 PM',
        room: 'PA202',
        teacherCode: null
    },
    {
        courseId: 'CSE4419',
        courseName: 'Network Security',
        section: '1',
        day: 'SAT',
        time: '4:30 PM - 5:50 PM',
        room: 'PA202',
        teacherCode: null
    },
    {
        courseId: 'CSE4461',
        courseName: 'Digital Image Processing',
        section: '1',
        day: 'THU',
        time: '1:40 PM - 3:00 PM',
        room: 'PA211',
        teacherCode: null
    },
    {
        courseId: 'CSE4461',
        courseName: 'Digital Image Processing',
        section: '1',
        day: 'SAT',
        time: '1:40 PM - 3:00 PM',
        room: 'PA211',
        teacherCode: null
    },
    {
        courseId: 'CSE4465',
        courseName: 'Natural Language Processing',
        section: '2',
        day: 'THU',
        time: '9:25 AM - 10:45 AM',
        room: 'PA210',
        teacherCode: null
    },
    {
        courseId: 'CSE4465',
        courseName: 'Natural Language Processing',
        section: '2',
        day: 'SAT',
        time: '9:25 AM - 10:45 AM',
        room: 'PA210',
        teacherCode: null
    },
    {
        courseId: 'STA2101',
        courseName: 'Statistics and Probability',
        section: '4',
        day: 'MON',
        time: '8:00 AM - 9:20 AM',
        room: 'PD101',
        teacherCode: null
    },
    {
        courseId: 'STA2101',
        courseName: 'Statistics and Probability',
        section: '4',
        day: 'WED',
        time: '8:00 AM - 9:20 AM',
        room: 'PD101',
        teacherCode: null
    }
];

// Google Sheets configuration
const GOOGLE_SHEETS_ID = '10PaMTrwqQXsdZZ0_8LyNybEcAsSGLY9A';
const GOOGLE_SHEETS_API_KEY = ''; // Add your API key if needed

