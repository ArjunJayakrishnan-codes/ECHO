# Backend Integration Checklist

Use this checklist to track your progress integrating the backend with your Echo app.

## Phase 1: Setup & Installation

- [ ] Backend dependencies installed
  ```bash
  cd server && npm install
  ```

- [ ] Backend server starts successfully
  ```bash
  cd server && npm run dev
  ```

- [ ] Backend health check passes
  ```bash
  curl http://localhost:3001/api/health
  ```

- [ ] Frontend runs without errors
  ```bash
  npm run dev
  ```

- [ ] Environment variables configured (optional)
  - [ ] Created `.env` in root directory
  - [ ] Set `VITE_API_URL`
  - [ ] Set `VITE_WS_URL`

## Phase 2: Authentication Migration

- [ ] Updated `AuthContext.tsx` to use `authAPI`
  - [ ] Replaced signup logic
  - [ ] Replaced login logic
  - [ ] Replaced logout logic
  - [ ] Added WebSocket connection on login
  - [ ] Added WebSocket disconnection on logout

- [ ] Tested signup flow
  - [ ] New user can register
  - [ ] JWT token received and stored
  - [ ] User redirected after signup

- [ ] Tested login flow
  - [ ] Existing user can login
  - [ ] JWT token received and stored
  - [ ] User redirected to dashboard

- [ ] Tested logout flow
  - [ ] User data cleared from state
  - [ ] Token removed from localStorage
  - [ ] WebSocket disconnected
  - [ ] Redirected to landing page

- [ ] Tested session persistence
  - [ ] Page refresh maintains login state
  - [ ] Invalid token handled gracefully

## Phase 3: Blog Integration

- [ ] Updated `BlogPage.tsx` to use `blogAPI`
  - [ ] Get all posts uses API
  - [ ] Create post uses API
  - [ ] Delete post uses API
  - [ ] Added loading states
  - [ ] Added error handling

- [ ] Tested blog features
  - [ ] Can view all blog posts
  - [ ] Can create new post
  - [ ] Can view single post
  - [ ] Can delete own post
  - [ ] Cannot delete other users' posts
  - [ ] Author name displays correctly

- [ ] UI updates correctly
  - [ ] Loading spinner shows during fetch
  - [ ] Error messages display on failure
  - [ ] Posts appear immediately after creation
  - [ ] Posts removed immediately after deletion

## Phase 4: Notes Integration

- [ ] Updated `NotesPage.tsx` to use `notesAPI`
  - [ ] Get all notes uses API
  - [ ] Create note uses API
  - [ ] Update note uses API
  - [ ] Delete note uses API
  - [ ] Share note uses API
  - [ ] Add comment uses API
  - [ ] Added loading states
  - [ ] Added error handling

- [ ] Tested notes features
  - [ ] Can view all notes
  - [ ] Can create new note
  - [ ] Can edit existing note
  - [ ] Can delete note
  - [ ] Can organize notes in folders
  - [ ] Can share note with another user
  - [ ] Can add comments to note

- [ ] Tested collaboration features
  - [ ] Shared notes accessible to recipient
  - [ ] Comments show correct author name
  - [ ] Timestamps display correctly

## Phase 5: Messaging Integration

- [ ] Updated `ChatPage.tsx` to use `messagesAPI` and `wsClient`
  - [ ] Get conversations uses API
  - [ ] Get messages uses API
  - [ ] Send message uses API
  - [ ] WebSocket connection established
  - [ ] Added message listeners
  - [ ] Added typing indicator
  - [ ] Added user status listener
  - [ ] Added loading states
  - [ ] Added error handling

- [ ] Tested messaging features
  - [ ] Can view conversation list
  - [ ] Can start new conversation
  - [ ] Can send messages
  - [ ] Messages appear in real-time
  - [ ] Can see online/offline status
  - [ ] Can see typing indicators
  - [ ] Read receipts work
  - [ ] Unread count updates

- [ ] Tested WebSocket features
  - [ ] Connection establishes on login
  - [ ] Receives messages in real-time
  - [ ] Typing indicator works
  - [ ] User status updates work
  - [ ] Reconnects after disconnect

## Phase 6: Error Handling & UX

- [ ] Added loading states to all API calls
  - [ ] Spinner or skeleton during fetch
  - [ ] Disabled buttons during submission
  - [ ] Loading indicators for long operations

- [ ] Added error handling
  - [ ] Network errors caught and displayed
  - [ ] 401 errors redirect to login
  - [ ] 403 errors show permission denied
  - [ ] 404 errors show not found
  - [ ] 500 errors show generic error

- [ ] Added success feedback
  - [ ] Toast notifications for success
  - [ ] Success messages after operations
  - [ ] Optimistic UI updates

- [ ] Improved UX
  - [ ] Debounced search inputs
  - [ ] Infinite scroll for long lists
  - [ ] Pull-to-refresh (if applicable)
  - [ ] Empty states for no data

## Phase 7: Testing & Validation

- [ ] Tested all features end-to-end
  - [ ] Signup → Login → Use features → Logout
  - [ ] Multiple users can interact
  - [ ] Real-time features work across tabs
  - [ ] Data persists across sessions

- [ ] Tested error scenarios
  - [ ] Backend server offline
  - [ ] Network disconnected
  - [ ] Invalid credentials
  - [ ] Expired token
  - [ ] Database errors

- [ ] Tested edge cases
  - [ ] Empty states (no posts, no notes, etc.)
  - [ ] Very long content
  - [ ] Special characters in input
  - [ ] Multiple rapid submissions
  - [ ] Browser refresh during operation

- [ ] Performance testing
  - [ ] Large number of posts loads quickly
  - [ ] Many messages don't slow down chat
  - [ ] WebSocket doesn't cause memory leaks
  - [ ] No unnecessary re-renders

## Phase 8: Code Quality

- [ ] Removed old localStorage code
  - [ ] No direct localStorage manipulation (except auth token)
  - [ ] Removed old data structures
  - [ ] Cleaned up unused functions

- [ ] Code organization
  - [ ] API calls centralized in services
  - [ ] No API logic in components
  - [ ] Consistent error handling
  - [ ] Consistent loading states

- [ ] Type safety
  - [ ] All API responses typed
  - [ ] No `any` types (or minimal)
  - [ ] Type guards where needed

- [ ] Code documentation
  - [ ] Complex functions commented
  - [ ] API service documented
  - [ ] WebSocket events documented

## Phase 9: Security Review

- [ ] Security measures in place
  - [ ] JWT token stored securely
  - [ ] Token included in all authenticated requests
  - [ ] No sensitive data in logs
  - [ ] Input sanitized before submission
  - [ ] XSS protection enabled

- [ ] Backend security
  - [ ] JWT_SECRET changed from default
  - [ ] Password hashing enabled
  - [ ] CORS configured correctly
  - [ ] Rate limiting (if implemented)

## Phase 10: Deployment Preparation

- [ ] Environment configuration
  - [ ] Development environment works
  - [ ] Production environment configured
  - [ ] Environment variables documented

- [ ] Database preparation
  - [ ] SQLite works for development
  - [ ] PostgreSQL setup (for production)
  - [ ] Database migrations planned

- [ ] Deployment planning
  - [ ] Frontend deployment target chosen
  - [ ] Backend deployment target chosen
  - [ ] Database hosting chosen
  - [ ] Domain name configured

- [ ] Production checklist
  - [ ] HTTPS/WSS enabled
  - [ ] Secure JWT_SECRET set
  - [ ] CORS restricted to frontend domain
  - [ ] Error logging enabled
  - [ ] Monitoring setup
  - [ ] Backup strategy planned

## Troubleshooting Notes

Use this section to track issues and solutions:

### Issue 1
**Problem**:
**Solution**:

### Issue 2
**Problem**:
**Solution**:

### Issue 3
**Problem**:
**Solution**:

## Progress Tracking

**Started**: ___________
**Completed**: ___________

**Time spent on each phase**:
- Phase 1 (Setup): _______
- Phase 2 (Auth): _______
- Phase 3 (Blog): _______
- Phase 4 (Notes): _______
- Phase 5 (Messages): _______
- Phase 6 (Error Handling): _______
- Phase 7 (Testing): _______
- Phase 8 (Code Quality): _______
- Phase 9 (Security): _______
- Phase 10 (Deployment): _______

**Total time**: _______

## Next Steps After Completion

Once all items are checked:

1. [ ] Run full regression test
2. [ ] Get code review (if applicable)
3. [ ] Deploy to staging environment
4. [ ] User acceptance testing
5. [ ] Deploy to production
6. [ ] Monitor for issues
7. [ ] Collect user feedback
8. [ ] Plan next iteration

## Resources

- Main Guide: `BACKEND_INTEGRATION.md`
- Quick Start: `GETTING_STARTED.md`
- Code Examples: `EXAMPLE_MIGRATION.md`
- Architecture: `ARCHITECTURE.md`
- API Docs: `server/README.md`

---

**Pro Tip**: Check off items as you complete them. Take breaks between phases. Don't hesitate to refer back to the example code when stuck!
