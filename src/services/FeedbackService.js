// services/FeedbackService.js
class FeedbackService {
  constructor(apiBaseUrl = '/api') {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Submit feedback for an alert
   * @param {string} alertId - The unique ID of the alert
   * @param {string} feedbackType - 'helpful' or 'not-helpful'
   * @param {Object} alertData - The complete alert object for context
   * @returns {Promise<Object>} Response from the server
   */
  async submitFeedback(alertId, feedbackType, alertData = null) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alertId,
          feedbackType,
          timestamp: new Date().toISOString(),
          alertData: alertData ? {
            title: alertData.title,
            description: alertData.description,
            disaster_type: alertData.analysis?.disaster_type,
            location: alertData.title.match(/in ([^,]+)/i)?.[1] || 'Unknown',
            original_timestamp: alertData.timestamp
          } : null,
          userAgent: navigator.userAgent,
          sessionId: this.getSessionId()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback statistics for analytics
   * @returns {Promise<Object>} Feedback statistics
   */
  async getFeedbackStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/feedback/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      throw error;
    }
  }

  /**
   * Get alerts filtered by feedback type
   * @param {string} feedbackType - 'helpful', 'not-helpful', or 'all'
   * @param {number} limit - Number of results to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Filtered alerts
   */
  async getFilteredAlerts(feedbackType = 'all', limit = 50, offset = 0) {
    try {
      const params = new URLSearchParams({
        feedback: feedbackType,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const response = await fetch(`${this.apiBaseUrl}/alerts/filtered?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filtered alerts:', error);
      throw error;
    }
  }

  /**
   * Generate or retrieve session ID for tracking
   * @returns {string} Session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('feedback_session_id');
    
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('feedback_session_id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Batch submit feedback (for offline sync)
   * @param {Array} feedbackBatch - Array of feedback objects
   * @returns {Promise<Object>} Batch submission result
   */
  async submitBatchFeedback(feedbackBatch) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/feedback/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedbackBatch,
          sessionId: this.getSessionId()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting batch feedback:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new FeedbackService();

// Also export the class for custom instances
export { FeedbackService };