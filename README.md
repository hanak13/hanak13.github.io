# 📚 KISS Academic Portal

## Complete Student Result & Examination Management System

A comprehensive web-based academic management system designed for **KISS (Kalinga Institute of Social Sciences)** that handles student marksheet generation, exam management, and administrative tasks.

---

## 🌟 Features

### 👨‍🏫 Staff Panel
- **Marksheet Management**
  - Create digital marksheets with student bio-data
  - Multi-semester marks entry (up to 8 semesters)
  - Automatic SGPA/CGPA calculation
  - Grade assignment based on customizable grading rules
  - QR code generation for verification
  - PDF export (Semester & Season results)
  - Digital signature integration

- **Exam Management**
  - Create online exams with MCQ and text-based questions
  - Add students to exam system
  - Configure exam duration
  - Publish exams for student access

- **Role-Based Access Control**
  - **Admin/All**: Full access to marksheet + exam
  - **Marksheet Only**: Can only create marksheets
  - **Exam Only**: Can only manage exams

### 👨‍🎓 Student Panel
- **Marksheet Viewing**
  - Search and view results using Roll Number + DOB
  - View Semester Result (all semesters combined)
  - View Season Result (current semester)
  - Print marksheets directly
  - QR code verification

- **Exam Portal**
  - Take online exams
  - Auto-submit on timer expiry
  - View results (if enabled by staff)

### 🛠️ Developer Console
Advanced features for system administrators:

1. **User Management**
   - Create custom staff/student accounts
   - Assign roles to staff (all/mark/exam)
   - View/delete users

2. **Subject Control**
   - Pre-define subject codes and names
   - Force staff to use controlled subjects
   - Organize by Level, Stream, Category, Honours

3. **Files & Analytics**
   - Advanced search & filter students
   - Bulk operations (delete, export CSV)
   - Edit existing student records
   - Analytics dashboard (pass rate, SGPA distribution)
   - Top performers leaderboard

4. **Backup & Restore**
   - Full system backup (JSON export)
   - Restore from backup
   - Auto-backup reminders

5. **Security**
   - Activity log tracking
   - Unauthorized access logging
   - Data encryption (placeholder)

6. **Theme Customization**
   - Custom colors
   - Dark mode
   - Custom logo & watermark upload

7. **Storage Monitor**
   - Real-time storage usage tracking
   - Storage warnings

8. **System Settings**
   - Grading rules configuration
   - Default marks configuration
   - Default signatures upload
   - Institute subtitle customization
   - Year range settings

---

## 🚀 Installation

### Quick Start (Browser)
1. Download all files to a folder
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge)
3. That's it! No server required.

### File Structure
```
kiss-portal/
├── index.html          # Main application
├── exam.html           # Exam system interface
├── exam.css            # Exam system styles
├── exam.js             # Exam system logic
├── style.css           # Main application styles
├── script.js           # Main application logic
├── logo.png            # Institute logo
├── background.jpeg     # Login background
├── qrcode.min.js       # QR code generation
├── html2pdf.bundle.min.js  # PDF generation
└── README.md           # This file
```

---

## 🔐 Default Login Credentials

### Staff (Admin - Full Access)
- **Username**: `system`
- **Password**: `root`
- **Role**: All permissions (Marksheet + Exam)

### Student
- **Username**: `student`
- **Password**: `kiss`

### Developer
- **Username**: `dev`
- **Password**: `******`

> ⚠️ **Security Note**: Change these default credentials in production!

---

## 📖 Usage Guide

### For Staff - Creating a Marksheet

1. **Login** with staff credentials
2. Choose **"Marksheet Management"**
3. **Step 0**: Enter institute & staff details
4. **Step 1**: Enter student bio-data
   - Upload student photo
   - Fill personal details
   - Select class, stream, honours
5. **Step 2**: Enter marks for subjects
   - Use "Subject Count" to generate rows
   - Navigate semesters using Prev/Next buttons
   - Enter marks for Theory, Practical, Other
   - Assign credits
6. **Preview** updates automatically
7. Click **"SAVE DATA TO SYSTEM"**
8. **Print** using the print buttons

### For Staff - Creating an Exam

1. Login with staff credentials
2. Choose **"Exam Management"**
3. **Manage Students**: Add students using Roll + DOB
4. **Create Exam**:
   - Enter exam title
   - Set timer (minutes)
   - Add questions (MCQ or Text)
   - Configure correct answers
5. Click **"Publish Exam"**
6. Students can now access the exam

### For Students - Viewing Results

1. Login with student credentials
2. Choose **"Check Marksheet"**
3. **Step 1**: Select result type (Semester/Season)
4. **Step 2**: Enter Roll Number + DOB
5. Click **"Search & View"**
6. **Print** the result

### For Students - Taking Exam

1. Login with student credentials
2. Choose **"Give Exam"**
3. Enter Roll Number + DOB
4. Answer questions
5. Click **"Submit Exam"** (or auto-submit on timer)

### For Developers - Advanced Settings

1. Login with developer credentials
2. Navigate through tabs:
   - **Settings**: Configure system defaults
   - **Files**: Manage student records
   - **Analytics**: View statistics
   - **Bulk Ops**: Mass operations
   - **Backup**: Data backup/restore
   - **Security**: Activity logs
   - **Theme**: Customize appearance
   - **Students**: View all students

---

## 🎨 Customization

### Change Institute Name
1. Login as **Staff**
2. Step 0: Enter your institute name
3. It will appear on all marksheets

### Upload Custom Logo
1. Login as **Developer**
2. Go to **Theme** tab
3. Upload logo image
4. Applies to all future marksheets

### Configure Grading Rules
1. Login as **Developer**
2. Go to **Settings** tab
3. Scroll to "Grading Logic"
4. Add/edit rules (percentage → grade → points)
5. Click **"SAVE SETTINGS"**

### Add Subject Control
1. Login as **Developer**
2. Enable **"Subject Control"** in Settings
3. Add subjects with:
   - Level (UG/PG)
   - Stream (UG-I, UG-II, etc.)
   - Category (Science/Arts/Commerce)
   - Honours
   - Subject Code & Name
4. Staff can now only select pre-defined subjects

---

## 🔧 Advanced Features

### Role-Based Staff Access

Create staff with specific permissions:

1. Login as **Developer**
2. Go to **Settings** → **User Management**
3. Select "Staff" as user type
4. Choose role:
   - **All Permissions**: Can access both marksheet & exam
   - **Marksheet Only**: Can only create marksheets
   - **Exam Only**: Can only manage exams
5. Create user

### Bulk Import Students (CSV)

1. Login as **Developer**
2. Go to **Bulk Ops** tab
3. Prepare CSV with columns:
   - roll, fname, lname, email, dob, class, stream, honours, year
4. Upload CSV
5. Click **"Import Students"**

### Edit Existing Student

1. Login as **Developer**
2. Go to **Files** tab
3. Search for student
4. Click **"✏️ Edit"**
5. Modify data and save

---

## 💾 Data Storage

### Local Storage (Primary)
- All data stored in browser's `localStorage`
- Instant access, works offline
- Limit: ~10MB per domain

### Firebase (Optional Cloud Backup)
- Secondary backup if online
- Auto-syncs when internet available
- Falls back to local if offline

### Backup Recommendations
1. Use **Developer → Backup** tab
2. Click **"Download Complete Backup"**
3. Save JSON file externally
4. Schedule weekly backups

---

## 🌐 Browser Compatibility

✅ **Fully Supported**:
- Google Chrome 90+
- Microsoft Edge 90+
- Firefox 88+
- Safari 14+

⚠️ **Limited Support**:
- Internet Explorer (not recommended)

---

## 📱 Mobile Support

- ✅ Responsive design for tablets
- ✅ Student panel mobile-friendly
- ⚠️ Staff panel (marksheet creation) best on desktop
- ✅ Exam system fully mobile-compatible

---

## 🐛 Troubleshooting

### "Storage is full" error
- Go to Developer → Files
- Delete old/test records
- Create backup, then clear data

### Marksheet not saving
- Check browser console for errors
- Ensure localStorage is enabled
- Try different browser
- Disable incognito/private mode

### PDF not printing
- Enable pop-ups for the site
- Check if `html2pdf.bundle.min.js` is loaded
- Try different browser

### Student login not working
- Verify credentials are correct
- Check if student exists in system
- Ensure DOB format matches (YYYY-MM-DD)

### Exam not showing
- Ensure exam is published by staff
- Check if student is added to exam system
- Verify Roll Number + DOB match

---

## 🔒 Security Notes

### For Production Use:
1. **Change default passwords** immediately
2. Host on **HTTPS** only
3. Implement **server-side authentication**
4. Add **IP whitelisting** for staff panel
5. Enable **Firebase security rules**
6. Regular **backups** to external storage
7. **Audit logs** review monthly

### Data Privacy:
- Student data stored locally in browser
- No data sent to third parties
- Optional Firebase backup (controlled by you)
- QR codes contain minimal data

---

## 📊 System Limits

- **Students**: Unlimited (limited by browser storage ~10MB)
- **Semesters**: 8 per student
- **Subjects**: Unlimited per semester
- **Exams**: Unlimited
- **Users**: Unlimited staff/student accounts
- **File Size**: ~1-2MB per student (with photo)

---

## 🆘 Support & Contact

**Developer**: Hanak Pradhan  
**Institution**: KISS (Kalinga Institute of Social Sciences)  
**Purpose**: Educational project for academic management

**Contact**:
- 📧 Email: pradhanhanak84@gmail.com
- 📧 Email: personal.hanak13@gmail.com
- 🐦 Twitter/X: [@HanakP13](https://x.com/HanakP13)
- 📷 Instagram: [@_solivagant_05](https://www.instagram.com/_solivagant_05/)
- 💬 Telegram: [@Stranger1303](https://t.me/Stranger1303)

---

## 📝 License & Credits

### License
This software is developed for **educational purposes only** by a Computer Science student at KISS.

### Credits
- **Developer**: Hanak Pradhan
- **Libraries Used**:
  - QRCode.js (QR code generation)
  - html2pdf.js (PDF generation)
  - Firebase (optional cloud storage)

### Disclaimer
This is a student project for educational and institutional use. The developer is not liable for any data loss or system issues. Always maintain regular backups.

---

## 🔄 Version History

### v2.0 (Current)
- ✅ Role-based access control
- ✅ Exam management system
- ✅ Subject control feature
- ✅ Advanced developer console
- ✅ Bulk operations
- ✅ Analytics dashboard
- ✅ Theme customization
- ✅ Cloud backup (Firebase)

### v1.0 (Initial)
- Basic marksheet generation
- Student search
- PDF export
- Local storage

---

## 🚀 Future Enhancements

- [ ] Email/SMS result notifications
- [ ] Certificate generator
- [ ] Attendance management
- [ ] Fee management
- [ ] Library management
- [ ] Timetable generator
- [ ] Parent portal
- [ ] Mobile app (React Native)

---

## ⚙️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: LocalStorage + Firebase Firestore
- **Libraries**: QRCode.js, html2pdf.js
- **Design**: Responsive CSS, Custom UI
- **Authentication**: Client-side (can be upgraded)

---

## 🎓 For Educational Institutions

This system can be customized for your institution. Contact the developer for:
- Custom branding
- Additional features
- Server deployment
- Database integration
- Staff training
- Technical support

---

**Made with ❤️ for KISS by Hanak Pradhan**  
*A Computer Science Student Project*

---

**Last Updated**: January 2026  
**Version**: 2.0