// Time slots for the timetable
const timeSlots = [
    { start: '8:00 AM', end: '9:20 AM', label: '8:00 AM - 9:20 AM' },
    { start: '9:25 AM', end: '10:45 AM', label: '9:25 AM - 10:45 AM' },
    { start: '10:50 AM', end: '12:10 PM', label: '10:50 AM - 12:10 PM' },
    { start: '12:15 PM', end: '1:35 PM', label: '12:15 PM - 1:35 PM' },
    { start: '1:40 PM', end: '3:00 PM', label: '1:40 PM - 3:00 PM' },
    { start: '3:05 PM', end: '4:25 PM', label: '3:05 PM - 4:25 PM' },
    { start: '4:30 PM', end: '5:50 PM', label: '4:30 PM - 5:50 PM' },
    { start: '5:55 PM', end: '7:15 PM', label: '5:55 PM - 7:15 PM' }
];

// Days of the week (Friday is a holiday)
const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Day index mapping
const dayIndexMap = {
    'SUN': 0,
    'MON': 1,
    'TUE': 2,
    'WED': 3,
    'THU': 4,
    'FRI': 5,
    'SAT': 6
};

// Parse time string to minutes for comparison
function parseTime(timeStr) {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
    if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
    return totalMinutes;
}

// Find time slot index for a given time string
function findTimeSlotIndex(timeString) {
    const [startTime, endTime] = timeString.split(' - ');
    const startMinutes = parseTime(startTime);
    
    for (let i = 0; i < timeSlots.length; i++) {
        const slotStartMinutes = parseTime(timeSlots[i].start);
        if (Math.abs(startMinutes - slotStartMinutes) < 30) {
            return i;
        }
    }
    return -1;
}

// Get teacher name from code
function getTeacherName(teacherCode) {
    if (!teacherCode) return 'TBA';
    return teacherMap[teacherCode] || teacherCode;
}

// Generate timetable
function generateTimetable() {
    const timetable = document.getElementById('timetable');
    timetable.innerHTML = '';

    // Create header
    const header = document.createElement('div');
    header.className = 'timetable-header';
    
    const timeHeader = document.createElement('div');
    timeHeader.className = 'header-cell';
    timeHeader.textContent = 'Time';
    header.appendChild(timeHeader);

    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'header-cell';
        if (day === 'FRI') {
            dayHeader.textContent = 'FRI (Holiday)';
            dayHeader.classList.add('holiday');
        } else {
            dayHeader.textContent = day;
        }
        header.appendChild(dayHeader);
    });

    timetable.appendChild(header);

    // Create time slots
    timeSlots.forEach((slot, slotIndex) => {
        const timeRow = document.createElement('div');
        timeRow.className = 'time-slot';

        // Time cell
        const timeCell = document.createElement('div');
        timeCell.className = 'time-cell';
        timeCell.textContent = slot.label;
        timeRow.appendChild(timeCell);

        // Day cells
        days.forEach((day, dayIndex) => {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.id = `cell-${dayIndex}-${slotIndex}`;
            
            // Mark Friday as holiday
            if (day === 'FRI') {
                dayCell.classList.add('holiday-cell');
            }

            // Find classes for this day and time slot
            const classes = scheduleData.filter(item => {
                if (item.day !== day) return false;
                const itemSlotIndex = findTimeSlotIndex(item.time);
                return itemSlotIndex === slotIndex;
            });

            // Add class cards
            classes.forEach(classItem => {
                const classCard = document.createElement('div');
                const hasTeacher = classItem.teacherCode; // Show teacher card styling if teacher code exists
                classCard.className = `class-card ${classItem.courseId.toLowerCase()}${hasTeacher ? ' has-teacher' : ''}`;
                
                const courseCode = document.createElement('div');
                courseCode.className = 'course-code';
                courseCode.textContent = `${classItem.courseId}-${classItem.section}`;
                classCard.appendChild(courseCode);

                const courseName = document.createElement('div');
                courseName.className = 'course-name';
                courseName.textContent = classItem.courseName;
                classCard.appendChild(courseName);

                const roomInfo = document.createElement('div');
                roomInfo.className = 'room-info';
                roomInfo.textContent = `📍 ${classItem.room}`;
                classCard.appendChild(roomInfo);

                if (classItem.teacherCode) {
                    const teacherFullName = getTeacherName(classItem.teacherCode);
                    // Always show teacher - if name exists show name, otherwise show code (including TBA)
                    const teacherDisplay = (teacherFullName && teacherFullName !== classItem.teacherCode) 
                        ? teacherFullName 
                        : classItem.teacherCode;
                    const teacherName = document.createElement('div');
                    teacherName.className = 'teacher-name';
                    teacherName.innerHTML = `<span class="teacher-icon">👤</span> ${teacherDisplay}`;
                    classCard.appendChild(teacherName);
                }

                dayCell.appendChild(classCard);
            });

            timeRow.appendChild(dayCell);
        });

        timetable.appendChild(timeRow);
    });

    // Generate mobile view
    generateMobileTimetable();
}

// Generate mobile-friendly timetable (card-based view)
function generateMobileTimetable() {
    const mobileTimetable = document.getElementById('mobile-timetable');
    if (!mobileTimetable) return;
    
    mobileTimetable.innerHTML = '';
    
    // Group classes by day
    const classesByDay = {};
    days.forEach(day => {
        classesByDay[day] = [];
    });
    
    scheduleData.forEach(item => {
        if (classesByDay[item.day]) {
            classesByDay[item.day].push(item);
        }
    });
    
    // Create day sections
    days.forEach(day => {
        const daySection = document.createElement('div');
        daySection.className = 'mobile-day-section';
        
        if (day === 'FRI') {
            daySection.classList.add('holiday-day');
        }
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'mobile-day-header';
        dayHeader.textContent = day === 'FRI' ? `${day} (Holiday)` : day;
        daySection.appendChild(dayHeader);
        
        const classesContainer = document.createElement('div');
        classesContainer.className = 'mobile-classes-container';
        
        if (day === 'FRI') {
            const holidayMsg = document.createElement('div');
            holidayMsg.className = 'holiday-message';
            holidayMsg.textContent = 'No classes - Holiday';
            classesContainer.appendChild(holidayMsg);
        } else if (classesByDay[day].length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-day-message';
            emptyMsg.textContent = 'No classes scheduled';
            classesContainer.appendChild(emptyMsg);
        } else {
            // Sort classes by time
            classesByDay[day].sort((a, b) => {
                const timeA = parseTime(a.time.split(' - ')[0]);
                const timeB = parseTime(b.time.split(' - ')[0]);
                return timeA - timeB;
            });
            
            classesByDay[day].forEach(classItem => {
                const classCard = document.createElement('div');
                classCard.className = `mobile-class-card ${classItem.courseId.toLowerCase()}`;
                
                const timeBadge = document.createElement('div');
                timeBadge.className = 'mobile-time-badge';
                timeBadge.textContent = classItem.time;
                classCard.appendChild(timeBadge);
                
                const courseCode = document.createElement('div');
                courseCode.className = 'mobile-course-code';
                courseCode.textContent = `${classItem.courseId}-${classItem.section}`;
                classCard.appendChild(courseCode);
                
                const courseName = document.createElement('div');
                courseName.className = 'mobile-course-name';
                courseName.textContent = classItem.courseName;
                classCard.appendChild(courseName);
                
                const roomInfo = document.createElement('div');
                roomInfo.className = 'mobile-room-info';
                roomInfo.innerHTML = `📍 ${classItem.room}`;
                classCard.appendChild(roomInfo);
                
                if (classItem.teacherCode) {
                    const teacherFullName = getTeacherName(classItem.teacherCode);
                    // Always show teacher - if name exists show name, otherwise show code (including TBA)
                    const teacherDisplay = (teacherFullName && teacherFullName !== classItem.teacherCode) 
                        ? teacherFullName 
                        : classItem.teacherCode;
                    const teacherName = document.createElement('div');
                    teacherName.className = 'mobile-teacher-name';
                    teacherName.innerHTML = `👤 ${teacherDisplay}`;
                    classCard.appendChild(teacherName);
                }
                
                classesContainer.appendChild(classCard);
            });
        }
        
        daySection.appendChild(classesContainer);
        mobileTimetable.appendChild(daySection);
    });
}


// Normalize course code (remove spaces, convert to uppercase)
function normalizeCourseCode(code) {
    if (!code) return '';
    return code.replace(/\s+/g, '').toUpperCase();
}

// Normalize section (remove leading zeros, handle variations)
function normalizeSection(section) {
    if (!section) return '';
    return section.toString().replace(/^0+/, '') || '0';
}

// Clean teacher code - remove anything in parentheses (e.g., "MSMM (T)" -> "MSMM")
function cleanTeacherCode(teacherCode) {
    if (!teacherCode) return '';
    // Remove anything in parentheses and trim
    return teacherCode.replace(/\s*\([^)]*\)/g, '').trim();
}

// Parse Google Sheets data format: "Course Code - Section - Room no - Teacher code"
// Also handles variations like "CSE 3202 -1 -PC 204 - MGK" or "CSE3202-1-PC204-MGK"
function parseCourseString(courseString) {
    if (!courseString) return null;
    
    // Try splitting by " - " first (standard format)
    let parts = courseString.split(' - ').map(p => p.trim());
    
    // If that doesn't work, try splitting by "-" (no spaces)
    if (parts.length < 4) {
        parts = courseString.split('-').map(p => p.trim());
    }
    
    if (parts.length >= 4) {
        const courseCode = normalizeCourseCode(parts[0]);
        const section = normalizeSection(parts[1]);
        const room = parts[2].trim();
        let teacherCode = parts[3].trim();
        
        // Clean teacher code - remove parentheses content (e.g., "MSMM (T)" -> "MSMM")
        teacherCode = cleanTeacherCode(teacherCode);
        
        return {
            courseCode: courseCode,
            section: section,
            room: room,
            teacherCode: teacherCode
        };
    }
    
    // Try alternative format: "Course Code Section Room Teacher" (space-separated)
    const spaceParts = courseString.trim().split(/\s+/);
    if (spaceParts.length >= 4) {
        // Try to identify course code (usually first 2-3 parts)
        // This is a fallback, less reliable
        const courseCode = normalizeCourseCode(spaceParts.slice(0, 2).join(''));
        const section = normalizeSection(spaceParts[2]);
        const room = spaceParts[3];
        let teacherCode = spaceParts.slice(4).join(' ') || spaceParts[3];
        
        // Clean teacher code - remove parentheses content
        teacherCode = cleanTeacherCode(teacherCode);
        
        return {
            courseCode: courseCode,
            section: section,
            room: room,
            teacherCode: teacherCode
        };
    }
    
    return null;
}

// Fetch data from Google Sheets (using CSV export)
async function fetchFromGoogleSheets() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    try {
        // Convert Google Sheets to CSV export URL
        // Try different gid values or use the published CSV URL
        const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/export?format=csv&gid=1474655950`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Sheets. Make sure the sheet is publicly accessible or published.');
        }

        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());
        
        console.log('Fetched CSV, total lines:', lines.length);
        console.log('First 5 lines:', lines.slice(0, 5));
        
        // Parse CSV and extract teacher information
        const newTeacherMap = {};
        const courseTeacherMap = {}; // Map course codes to teacher codes (normalized keys)
        const matchedCourses = [];
        const unmatchedCourses = [];
        const debugInfo = []; // For debugging

        lines.forEach((line, index) => {
            // Parse CSV line (handle quoted fields)
            const cells = [];
            let currentCell = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    cells.push(currentCell.trim());
                    currentCell = '';
                } else {
                    currentCell += char;
                }
            }
            cells.push(currentCell.trim());
            
            // Look for course strings in the format: "Course Code - Section - Room - Teacher"
            cells.forEach((cell, cellIndex) => {
                if (!cell || cell.length < 3) return; // Skip very short cells
                
                // Try to parse as course string
                const parsed = parseCourseString(cell);
                if (parsed && parsed.teacherCode) {
                    // Teacher code is already cleaned in parseCourseString, but clean again to be safe
                    let teacherCode = cleanTeacherCode(parsed.teacherCode.trim());
                    const normalizedCourseCode = normalizeCourseCode(parsed.courseCode);
                    const normalizedSection = normalizeSection(parsed.section);
                    const courseKey = `${normalizedCourseCode}-${normalizedSection}`;
                    
                    debugInfo.push({
                        raw: cell,
                        parsed: parsed,
                        courseKey: courseKey,
                        line: index + 1,
                        cell: cellIndex
                    });
                    
                    // Store teacher code for this course (extract just the code if it includes name)
                    let teacherCodeOnly = teacherCode;
                    if (teacherCode.includes(' - ')) {
                        const parts = teacherCode.split(' - ');
                        teacherCodeOnly = cleanTeacherCode(parts[0].trim());
                        const teacherName = parts.slice(1).join(' - ').trim();
                        if (teacherName) {
                            newTeacherMap[teacherCodeOnly] = teacherName;
                            console.log(`Found teacher: ${teacherCodeOnly} = ${teacherName}`);
                        }
                    } else {
                        // Clean the teacher code (remove parentheses)
                        teacherCodeOnly = cleanTeacherCode(teacherCode);
                    }
                    
                    // Store teacher code for this course
                    if (!courseTeacherMap[courseKey] || courseTeacherMap[courseKey] !== teacherCodeOnly) {
                        courseTeacherMap[courseKey] = teacherCodeOnly;
                        console.log(`Mapped course: ${courseKey} → ${teacherCodeOnly}`);
                    }
                    
                    // If teacher code doesn't have a name, try to keep existing or set placeholder
                    if (!newTeacherMap[teacherCodeOnly]) {
                        if (teacherMap[teacherCodeOnly]) {
                            newTeacherMap[teacherCodeOnly] = teacherMap[teacherCodeOnly];
                        } else {
                            newTeacherMap[teacherCodeOnly] = teacherCodeOnly; // Will be updated if name found later
                        }
                    }
                }
                
                // Also look for teacher mappings in format "CODE - Name" (standalone)
                if (cell.includes(' - ') && cell.split(' - ').length === 2) {
                    const parts = cell.split(' - ').map(p => p.trim());
                    // Clean the code part (remove parentheses like "MSMM (T)" -> "MSMM")
                    const cleanedCode = cleanTeacherCode(parts[0]);
                    // Check if first part looks like a teacher code (short, uppercase, 2-10 chars)
                    if (cleanedCode.length >= 2 && cleanedCode.length <= 10 && cleanedCode.match(/^[A-Z0-9]+$/)) {
                        newTeacherMap[cleanedCode] = parts[1];
                        console.log(`Found standalone teacher: ${cleanedCode} = ${parts[1]}`);
                    }
                }
            });
        });

        // Update teacher map
        Object.assign(teacherMap, newTeacherMap);
        
        console.log('Course-Teacher Map:', courseTeacherMap);
        console.log('Teacher Map:', newTeacherMap);
        console.log('Debug Info (first 10):', debugInfo.slice(0, 10));

        // Automatically match and assign teachers to courses in scheduleData
        scheduleData.forEach(item => {
            const normalizedCourseId = normalizeCourseCode(item.courseId);
            const normalizedSection = normalizeSection(item.section);
            const courseKey = `${normalizedCourseId}-${normalizedSection}`;
            
            console.log(`Looking for: ${courseKey} (from ${item.courseId}-${item.section})`);
            
            // Try exact match first
            if (courseTeacherMap[courseKey]) {
                const teacherCode = courseTeacherMap[courseKey].split(' - ')[0].trim();
                item.teacherCode = teacherCode;
                console.log(`✅ Matched ${courseKey} → ${teacherCode}`);
                matchedCourses.push({
                    course: `${item.courseId}-${item.section}`,
                    teacher: teacherCode
                });
            } else {
                // Try fuzzy matching - match by course code only (if section doesn't match)
                const matchingKey = Object.keys(courseTeacherMap).find(key => {
                    const [code] = key.split('-');
                    return code === normalizedCourseId;
                });
                
                if (matchingKey) {
                    const teacherCode = courseTeacherMap[matchingKey].split(' - ')[0].trim();
                    item.teacherCode = teacherCode;
                    console.log(`⚠️ Fuzzy matched ${courseKey} → ${teacherCode} (from ${matchingKey})`);
                    matchedCourses.push({
                        course: `${item.courseId}-${item.section}`,
                        teacher: teacherCode,
                        note: 'Matched by course code only'
                    });
                } else {
                    console.log(`❌ No match found for ${courseKey}`);
                    unmatchedCourses.push(`${item.courseId}-${item.section}`);
                }
            }
        });

        generateTimetable();
    } catch (error) {
        console.error('Error fetching from Google Sheets:', error);
        // Silently fail and just show the timetable without teachers
    } finally {
        loading.classList.remove('show');
    }
}



// Export to PDF - Create proper PDF document
function exportToPDF() {
    const pdfButton = document.getElementById('pdfButton');
    if (pdfButton) {
        pdfButton.disabled = true;
        pdfButton.innerHTML = '<span class="pdf-icon">⏳</span><span class="pdf-text">...</span>';
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        // PDF dimensions in landscape
        const pageWidth = 297;
        const pageHeight = 210;
        const margin = 10;
        const tableStartY = 25;
        let currentY = tableStartY;
        
        // Title
        pdf.setFontSize(20);
        pdf.setFont(undefined, 'bold');
        pdf.text('University Timetable', pageWidth / 2, 15, { align: 'center' });
        
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'normal');
        pdf.text('Spring 2026 Schedule', pageWidth / 2, 22, { align: 'center' });
        
        // Table setup
        const colWidth = (pageWidth - 2 * margin - 30) / 8; // 8 columns (time + 7 days)
        const rowHeight = 18; // Increased to fit course name and room
        const timeColWidth = 30;
        const startX = margin;
        
        // Helper function to wrap text
        function wrapText(text, maxWidth) {
            const words = text.split(' ');
            const lines = [];
            let currentLine = '';
            
            words.forEach(word => {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const testWidth = pdf.getTextWidth(testLine);
                if (testWidth > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            if (currentLine) {
                lines.push(currentLine);
            }
            return lines;
        }
        
        // Draw table header
        pdf.setFillColor(102, 126, 234);
        pdf.rect(startX, currentY, timeColWidth, rowHeight, 'F');
        pdf.setFillColor(230, 62, 62);
        pdf.rect(startX + timeColWidth + 5 * colWidth, currentY, colWidth, rowHeight, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.text('Time', startX + timeColWidth / 2, currentY + 8, { align: 'center' });
        
        let headerX = startX + timeColWidth;
        days.forEach((day, index) => {
            if (day === 'FRI') {
                pdf.setFillColor(230, 62, 62);
                pdf.rect(headerX, currentY, colWidth, rowHeight, 'F');
                pdf.text('FRI (H)', headerX + colWidth / 2, currentY + 8, { align: 'center' });
            } else {
                pdf.setFillColor(102, 126, 234);
                pdf.rect(headerX, currentY, colWidth, rowHeight, 'F');
                pdf.text(day, headerX + colWidth / 2, currentY + 8, { align: 'center' });
            }
            headerX += colWidth;
        });
        
        currentY += rowHeight;
        pdf.setTextColor(0, 0, 0);
        
        // Draw time slots and classes
        timeSlots.forEach((slot, slotIndex) => {
            // Time cell
            pdf.setFillColor(247, 250, 252);
            pdf.rect(startX, currentY, timeColWidth, rowHeight, 'F');
            pdf.setDrawColor(226, 232, 240);
            pdf.rect(startX, currentY, timeColWidth, rowHeight);
            
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            const timeLines = wrapText(slot.label, timeColWidth - 4);
            timeLines.forEach((line, idx) => {
                pdf.text(line, startX + timeColWidth / 2, currentY + 5 + (idx * 4), { align: 'center' });
            });
            
            // Day cells
            let cellX = startX + timeColWidth;
            days.forEach((day, dayIndex) => {
                // Find classes for this day and time slot
                const classes = scheduleData.filter(item => {
                    if (item.day !== day) return false;
                    const itemSlotIndex = findTimeSlotIndex(item.time);
                    return itemSlotIndex === slotIndex;
                });
                
                // Draw cell background
                if (day === 'FRI') {
                    pdf.setFillColor(254, 215, 215);
                } else {
                    pdf.setFillColor(255, 255, 255);
                }
                pdf.rect(cellX, currentY, colWidth, rowHeight, 'F');
                pdf.setDrawColor(226, 232, 240);
                pdf.rect(cellX, currentY, colWidth, rowHeight);
                
                // Draw classes in this cell
                if (classes.length > 0 && day !== 'FRI') {
                    classes.forEach((classItem, classIdx) => {
                        const classY = currentY + 2;
                        const maxHeight = rowHeight - 4;
                        let textY = classY;
                        
                        // Course code and section
                        pdf.setFontSize(7);
                        pdf.setFont(undefined, 'bold');
                        pdf.setTextColor(45, 55, 72);
                        const courseCode = `${classItem.courseId}-${classItem.section}`;
                        pdf.text(courseCode, cellX + 2, textY, { maxWidth: colWidth - 4 });
                        textY += 3.5;
                        
                        // Course name - always show, make it visible
                        pdf.setFontSize(6);
                        pdf.setFont(undefined, 'normal');
                        pdf.setTextColor(45, 55, 72);
                        const courseNameLines = wrapText(classItem.courseName, colWidth - 4);
                        const maxCourseNameLines = Math.min(courseNameLines.length, 2); // Limit to 2 lines for space
                        courseNameLines.slice(0, maxCourseNameLines).forEach((line, idx) => {
                            if (textY + (idx * 3) < currentY + maxHeight - 6) {
                                pdf.text(line, cellX + 2, textY + (idx * 3), { maxWidth: colWidth - 4 });
                            }
                        });
                        textY += maxCourseNameLines > 0 ? maxCourseNameLines * 3 : 3;
                        
                        // Room - always show
                        pdf.setFontSize(6);
                        pdf.setTextColor(113, 128, 150);
                        if (textY < currentY + maxHeight - 3) {
                            pdf.text(`Room: ${classItem.room}`, cellX + 2, textY, { maxWidth: colWidth - 4 });
                            textY += 3;
                        }
                        
                        // Teacher name - always show code, show name if available
                        if (classItem.teacherCode && textY < currentY + maxHeight - 2) {
                            const teacherFullName = getTeacherName(classItem.teacherCode);
                            // Show name if different from code, otherwise show code (including TBA)
                            const teacherDisplay = (teacherFullName && teacherFullName !== classItem.teacherCode) 
                                ? teacherFullName 
                                : classItem.teacherCode;
                            pdf.setFontSize(5.5);
                            pdf.setTextColor(45, 55, 72);
                            const teacherLines = wrapText(`T: ${teacherDisplay}`, colWidth - 4);
                            teacherLines.slice(0, 1).forEach((line, idx) => {
                                if (textY + (idx * 3) < currentY + maxHeight) {
                                    pdf.text(line, cellX + 2, textY + (idx * 3), { maxWidth: colWidth - 4 });
                                }
                            });
                        }
                        
                        pdf.setTextColor(0, 0, 0);
                    });
                } else if (day === 'FRI') {
                    pdf.setFontSize(7);
                    pdf.setFont(undefined, 'italic');
                    pdf.setTextColor(230, 62, 62);
                    pdf.text('Holiday', cellX + colWidth / 2, currentY + rowHeight / 2, { align: 'center' });
                    pdf.setTextColor(0, 0, 0);
                }
                
                cellX += colWidth;
            });
            
            currentY += rowHeight;
            
            // Check if we need a new page
            if (currentY > pageHeight - margin && slotIndex < timeSlots.length - 1) {
                pdf.addPage();
                currentY = margin;
                
                // Redraw header on new page
                pdf.setFillColor(102, 126, 234);
                pdf.rect(startX, currentY, timeColWidth, rowHeight, 'F');
                pdf.setFillColor(230, 62, 62);
                pdf.rect(startX + timeColWidth + 5 * colWidth, currentY, colWidth, rowHeight, 'F');
                
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'bold');
                pdf.text('Time', startX + timeColWidth / 2, currentY + 8, { align: 'center' });
                
                headerX = startX + timeColWidth;
                days.forEach((day) => {
                    if (day === 'FRI') {
                        pdf.setFillColor(230, 62, 62);
                        pdf.rect(headerX, currentY, colWidth, rowHeight, 'F');
                        pdf.text('FRI (H)', headerX + colWidth / 2, currentY + 8, { align: 'center' });
                    } else {
                        pdf.setFillColor(102, 126, 234);
                        pdf.rect(headerX, currentY, colWidth, rowHeight, 'F');
                        pdf.text(day, headerX + colWidth / 2, currentY + 8, { align: 'center' });
                    }
                    headerX += colWidth;
                });
                
                currentY += rowHeight;
                pdf.setTextColor(0, 0, 0);
            }
        });
        
        // Footer
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(128, 128, 128);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 5,
                { align: 'center' }
            );
            pdf.text(
                'Generated by Routine Maker',
                pageWidth - margin,
                pageHeight - 5,
                { align: 'right' }
            );
        }
        
        // Save PDF
        pdf.save('timetable.pdf');
        
        if (pdfButton) {
            pdfButton.disabled = false;
            pdfButton.innerHTML = '<span class="pdf-icon">📄</span><span class="pdf-text">PDF</span>';
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
        const pdfButton = document.getElementById('pdfButton');
        if (pdfButton) {
            pdfButton.disabled = false;
            pdfButton.innerHTML = '<span class="pdf-icon">📄</span><span class="pdf-text">PDF</span>';
        }
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
                // Update service worker if available
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New service worker available');
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Notification Management
let notificationPermission = null;
let scheduledNotifications = [];

// Request notification permission
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        return permission === 'granted';
    }

    return false;
}

// Convert day name to day index (0 = Sunday, 6 = Saturday)
function getDayIndex(dayName) {
    const dayMap = {
        'SUN': 0,
        'MON': 1,
        'TUE': 2,
        'WED': 3,
        'THU': 4,
        'FRI': 5,
        'SAT': 6
    };
    return dayMap[dayName] ?? -1;
}

// Get next occurrence of a day and time
function getNextClassTime(dayIndex, timeString, notificationMinutesBefore = 10) {
    const now = new Date();
    const [startTime] = timeString.split(' - ');
    const startMinutes = parseTime(startTime);
    
    // Calculate hours and minutes
    const hours = Math.floor(startMinutes / 60);
    const minutes = startMinutes % 60;
    
    // Create target date for this week
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    // Subtract notification minutes
    target.setMinutes(target.getMinutes() - notificationMinutesBefore);
    
    // Find next occurrence of the day
    const currentDay = now.getDay();
    let daysUntilTarget = dayIndex - currentDay;
    
    // If the day has passed this week, or it's today but time has passed
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && target < now)) {
        daysUntilTarget += 7; // Next week
    }
    
    target.setDate(now.getDate() + daysUntilTarget);
    
    return target;
}

// Schedule a notification for a class
function scheduleClassNotification(classItem) {
    if (notificationPermission !== 'granted') {
        return;
    }

    const dayIndex = getDayIndex(classItem.day);
    if (dayIndex === -1) return;

    const notificationTime = getNextClassTime(dayIndex, classItem.time, 10); // 10 minutes before
    
    // Only schedule if in the future
    if (notificationTime <= new Date()) {
        return;
    }

    const timeUntilNotification = notificationTime.getTime() - Date.now();
    
    // Use setTimeout for scheduling (for simplicity)
    // In production, you might want to use a more robust scheduling system
    const timeoutId = setTimeout(() => {
        showClassNotification(classItem);
        
        // Schedule next week's notification
        scheduleClassNotification(classItem);
    }, timeUntilNotification);

    scheduledNotifications.push({
        timeoutId: timeoutId,
        classItem: classItem,
        scheduledTime: notificationTime
    });

    console.log(`Scheduled notification for ${classItem.courseId} on ${classItem.day} at ${notificationTime.toLocaleString()}`);
}

// Show notification for a class
function showClassNotification(classItem) {
    if (notificationPermission !== 'granted') {
        return;
    }

    const teacherName = classItem.teacherCode ? getTeacherName(classItem.teacherCode) : 'TBA';
    const notificationTitle = `Class Reminder: ${classItem.courseId}-${classItem.section}`;
    const notificationBody = `${classItem.courseName}\nTime: ${classItem.time}\nRoom: ${classItem.room}\nTeacher: ${teacherName}`;

    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(notificationTitle, {
                body: notificationBody,
                icon: `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/manifest.json`,
                badge: `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/manifest.json`,
                tag: `class-${classItem.courseId}-${classItem.day}`,
                requireInteraction: false,
                vibrate: [200, 100, 200],
                data: {
                    courseId: classItem.courseId,
                    courseName: classItem.courseName,
                    time: classItem.time,
                    room: classItem.room
                }
            }).catch(err => console.error('Notification error:', err));
        });
    } else {
        // Fallback to regular Notification API
        new Notification(notificationTitle, {
            body: notificationBody,
            icon: './manifest.json',
            tag: `class-${classItem.courseId}-${classItem.day}`
        });
    }
}

// Schedule all class notifications
function scheduleAllNotifications() {
    // Clear existing notifications
    scheduledNotifications.forEach(notification => {
        clearTimeout(notification.timeoutId);
    });
    scheduledNotifications = [];

    // Schedule notifications for all classes
    scheduleData.forEach(classItem => {
        if (classItem.day !== 'FRI') { // Skip Friday (holiday)
            scheduleClassNotification(classItem);
        }
    });

    console.log(`Scheduled ${scheduledNotifications.length} notifications`);
    
    // Also send schedule data to service worker for background notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.active.postMessage({
                type: 'SCHEDULE_NOTIFICATIONS',
                scheduleData: scheduleData
            });
        });
    }
}

// Initialize notifications
async function initializeNotifications() {
    const hasPermission = await requestNotificationPermission();
    
    if (hasPermission) {
        scheduleAllNotifications();
        console.log('Notifications initialized and scheduled');
    } else {
        console.log('Notification permission not granted');
    }
}

// Event listeners - Auto-fetch on page load
document.addEventListener('DOMContentLoaded', () => {
    // Generate timetable first with existing data
    generateTimetable();
    
    // Automatically fetch and assign teachers from Google Sheets
    fetchFromGoogleSheets();
    
    // Add PDF button event listener
    const pdfButton = document.getElementById('pdfButton');
    if (pdfButton) {
        pdfButton.addEventListener('click', exportToPDF);
    }
    
    // Initialize notifications after a short delay to ensure data is loaded
    setTimeout(() => {
        initializeNotifications();
    }, 1000);
});

// Print styles
const style = document.createElement('style');
style.textContent = `
    @media print {
        body {
            background: white;
            padding: 0;
        }
        .container {
            box-shadow: none;
            padding: 20px;
        }
        .timetable {
            box-shadow: none;
        }
    }
`;
document.head.appendChild(style);

