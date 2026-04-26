// src/utils/googleTasksLib.js

const BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

// Helper to get headers
function getHeaders() {
   const token = localStorage.getItem('google_oauth_token');
   if (!token) throw new Error('No Google OAuth Token found. User must re-authenticate.');
   return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
   };
}

// 1. Get or Create the "FORGE Habits" Task List
export async function getOrCreateForgeTaskList() {
   try {
      // Fetch all task lists
      const response = await fetch(`${BASE_URL}/users/@me/lists`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Failed to fetch task lists');

      const data = await response.json();
      const forgeList = data.items?.find(list => list.title === 'FORGE Habits');

      if (forgeList) {
         return forgeList.id;
      }

      // Create it if it doesn't exist
      const createRes = await fetch(`${BASE_URL}/users/@me/lists`, {
         method: 'POST',
         headers: getHeaders(),
         body: JSON.stringify({ title: 'FORGE Habits' })
      });
      if (!createRes.ok) throw new Error('Failed to create FORGE task list');

      const newList = await createRes.json();
      return newList.id;
   } catch (error) {
      console.error('Error in getOrCreateForgeTaskList:', error);
      return null;
   }
}

// 2. Insert a new Task (Habit) for today
export async function createGoogleTask(taskListId, title, notes, dueDate) {
   try {
      const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks`, {
         method: 'POST',
         headers: getHeaders(),
         body: JSON.stringify({
            title: title,
            notes: notes, // We will put the random excuse here
            due: dueDate // ISO String, e.g. '2026-02-23T00:00:00.000Z'
         })
      });
      if (!response.ok) throw new Error('Failed to create task');
      return await response.json();
   } catch (error) {
      console.error('Error creating Google Task:', error);
      return null;
   }
}

// 3. Mark a Task as Completed (When completed in FORGE)
export async function completeGoogleTask(taskListId, taskId) {
   try {
      const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
         method: 'PATCH',
         headers: getHeaders(),
         body: JSON.stringify({ status: 'completed' })
      });
      if (!response.ok) throw new Error('Failed to complete task in Google Tasks');
      return true;
   } catch (error) {
      console.error('Error completing Google Task:', error);
      return false;
   }
}

// 4. Check if a Task is Completed in Google Tasks (For Two-way sync)
export async function getGoogleTaskStatus(taskListId, taskId) {
   try {
      const response = await fetch(`${BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
         headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to get task status');
      const data = await response.json();
      return data.status === 'completed';
   } catch (error) {
      console.error('Error reading Google Task status:', error);
      return false;
   }
}
