Project Name: Veloro Collaboration Platform (MVP)
Primary Focus: Frontend Development (Backend to be addressed later)

Project Overview
Veloro is a collaborative group chat platform designed for freelancers and project teams, emphasizing real-time communication, tiered features, and AI-driven insights. The MVP focuses on:

Tiered Group Chats (Starter, Pro, Elite) with features like:

Real-time messaging, file sharing, task integration.

Tier-specific limits (e.g., file size, chat history, group size).

AI-powered progress tracking ("Velo Insights").

Collaboration Flow:

Project creation → Task discussion → Real-time updates → Resource management → Archiving.

Student Program Integration:

Skill mapping, mentorship, part-time gigs, and gamified learning.

Immediate Goals
Frontend Structure:

Build a responsive UI for:

Project Dashboard (chat window, task panel, file repository).

Tier-Specific Views (e.g., Starter tier hides voice/video features).

Student Program Onboarding (profile builder, skill assessment quiz).

Use frameworks like React.js + Tailwind CSS for modularity.

CHANGELOG.md Instructions:

Automatically log all changes (e.g., feature additions, bug fixes, UI tweaks) in CHANGELOG.md with:

Timestamped entries.

Categorized sections (Added, Fixed, Improved, Removed).

Links to relevant code/files.

AI Integration (Later Phase):

Flag backend tasks for future (e.g., real-time notifications, Velo AI analysis).

Start with the Starter Tier UI (frontend-only).

Cascade will flag backend dependencies (e.g., APIs, databases) for later.

Prioritize modular components for easy tier upgrades.

CHANGELOG Update Protocol
Trigger:

When the command velo changelog push is executed, Cascade AI must:

Parse the command’s arguments (e.g., message, category, linked files).

Generate a timestamped entry.

Append the entry to CHANGELOG.md in the correct format.

Auto-Detect Changes:

If linked files are modified (e.g., ChatInterface.jsx), tag them in the log.

Validation:

Ensure entries are categorized (Added, Fixed, Improved, Breaking).

Reject empty messages or invalid categories.

Git Integration (Optional):

If the project uses Git, auto-commit CHANGELOG.md after updates.

Sample Command Execution:

bash
Copy
velo changelog push "Fixed search bar styling" --category=Fixed --files=SearchBar.jsx  
Result in CHANGELOG.md:

markdown

Backend dependencies (APIs, databases) will be flagged with <!-- BACKEND_TODO --> for future phases.



Let’s code! 🚀 (Reminder: Update CHANGELOG.md after each change!)
