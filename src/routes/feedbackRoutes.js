// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();

// Import your database connection (example with MongoDB)
// const { MongoClient } = require('mongodb');
// const db = require('../config/database');

// Example with a simple in-memory store (replace with your actual database)
let feedbackStore = [];
let alertStore = [];

/**
 * POST /api/feedback
 * Submit feedback for an alert
 */
router.post('/feedback', async (req, res) => {
  try {
    const { alertId, feedbackType, timestamp, alertData, userAgent, sessionId } = req.body;

    // Validate input
    if (!alertId || !feedbackType) {
      return res.status(400).json({
        error: 'Missing required fields: alertId and feedbackType'
      });
    }

    if (!['helpful', 'not-helpful'].includes(feedbackType)) {
      return res.status(400).json({
        error: 'Invalid feedbackType. Must be "helpful" or "not-helpful"'
      });
    }

    // Create feedback record
    const feedbackRecord = {
      id: generateId(),
      alertId,
      feedbackType,
      timestamp: timestamp || new Date().toISOString(),
      alertData,
      userAgent,
      sessionId,
      ipAddress: req.ip,
      createdAt: new Date().toISOString()
    };

    // Save to database
    // For MongoDB example:
    // await db.collection('feedback').insertOne(feedbackRecord);
    
    // For in-memory example:
    feedbackStore.push(feedbackRecord);

    // Update alert with feedback count
    await updateAlertFeedbackCount(alertId, feedbackType);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedbackRecord.id
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/feedback/batch
 * Submit multiple feedback records
 */
router.post('/feedback/batch', async (req, res) => {
  try {
    const { feedback, sessionId } = req.body;

    if (!Array.isArray(feedback) || feedback.length === 0) {
      return res.status(400).json({
        error: 'Invalid feedback batch. Must be a non-empty array'
      });
    }

    const results = [];
    
    for (const item of feedback) {
      try {
        const feedbackRecord = {
          id: generateId(),
          ...item,
          sessionId,
          ipAddress: req.ip,
          createdAt: new Date().toISOString()
        };

        // Save to database
        feedbackStore.push(feedbackRecord);
        await updateAlertFeedbackCount(item.alertId, item.feedbackType);
        
        results.push({ success: true, feedbackId: feedbackRecord.id });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Batch feedback processed',
      results
    });

  } catch (error) {
    console.error('Error processing batch feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/feedback/stats
 * Get feedback statistics
 */
router.get('/feedback/stats', async (req, res) => {
  try {
    // Calculate statistics
    const stats = {
      total: feedbackStore.length,
      helpful: feedbackStore.filter(f => f.feedbackType === 'helpful').length,
      notHelpful: feedbackStore.filter(f => f.feedbackType === 'not-helpful').length,
      byDisasterType: {},
      byTimeRange: {},
      topAlerts: []
    };

    // Group by disaster type
    feedbackStore.forEach(feedback => {
      if (feedback.alertData && feedback.alertData.disaster_type) {
        const type = feedback.alertData.disaster_type;
        if (!stats.byDisasterType[type]) {
          stats.byDisasterType[type] = { helpful: 0, notHelpful: 0 };
        }
        stats.byDisasterType[type][feedback.feedbackType === 'helpful' ? 'helpful' : 'notHelpful']++;
      }
    });

    // Calculate helpfulness ratio
    stats.helpfulnessRatio = stats.total > 0 ? (stats.helpful / stats.total) : 0;

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/alerts/filtered
 * Get alerts filtered by feedback
 */
router.get('/alerts/filtered', async (req, res) => {
  try {
    const { feedback = 'all', limit = 50, offset = 0 } = req.query;
    
    let filteredAlerts = [...alertStore];

    // Filter by feedback type
    if (feedback !== 'all') {
      const alertsWithFeedback = feedbackStore
        .filter(f => f.feedbackType === feedback)
        .map(f => f.alertId);
      
      filteredAlerts = filteredAlerts.filter(alert => 
        alertsWithFeedback.includes(alert.id)
      );
    }

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    res.json({
      success: true,
      alerts: paginatedAlerts,
      total: filteredAlerts.length,
      hasMore: endIndex < filteredAlerts.length
    });

  } catch (error) {
    console.error('Error fetching filtered alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/alerts/:id/feedback
 * Get all feedback for a specific alert
 */
router.get('/alerts/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    
    const alertFeedback = feedbackStore.filter(f => f.alertId === id);
    
    const summary = {
      total: alertFeedback.length,
      helpful: alertFeedback.filter(f => f.feedbackType === 'helpful').length,
      notHelpful: alertFeedback.filter(f => f.feedbackType === 'not-helpful').length,
      feedback: alertFeedback.map(f => ({
        id: f.id,
        type: f.feedbackType,
        timestamp: f.timestamp,
        sessionId: f.sessionId
      }))
    };

    res.json({
      success: true,
      alertId: id,
      ...summary
    });

  } catch (error) {
    console.error('Error fetching alert feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Helper functions
function generateId() {
  return 'feedback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function updateAlertFeedbackCount(alertId, feedbackType) {
  // Update alert's feedback count in database
  // This is a simplified example - implement based on your data structure
  
  const alertIndex = alertStore.findIndex(alert => alert.id === alertId);
  if (alertIndex !== -1) {
    if (!alertStore[alertIndex].feedbackCount) {
      alertStore[alertIndex].feedbackCount = { helpful: 0, notHelpful: 0 };
    }
    
    if (feedbackType === 'helpful') {
      alertStore[alertIndex].feedbackCount.helpful++;
    } else {
      alertStore[alertIndex].feedbackCount.notHelpful++;
    }
  }
}

module.exports = router;