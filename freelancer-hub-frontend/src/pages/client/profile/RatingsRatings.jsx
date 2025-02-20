import React, { useState, useEffect } from 'react';
import { Button, Pagination, Input, Modal } from 'antd';
import { GoReply } from "react-icons/go";
import axios from 'axios';
import Cookies from 'js-cookie';

const ReviewsRatings = () => {
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const pageSize = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      const accessToken = Cookies.get('accessToken');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_reviews', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        
        setReviewsList(data.reviews);
        setAverageRating(data.average_rating); // Assuming the API returns the average rating
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const handleReplyClick = (reviewId) => {
    setReplyReviewId(reviewId);
    setIsReplyModalVisible(true);
  };

  const handleReplySubmit = async () => {
    const accessToken = Cookies.get('accessToken');
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/client/post_reply/', 
        {
          review_id: replyReviewId,
          reply_text: replyText,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Refresh reviews after posting the reply
      const updatedReviews = [...reviewsList];
      const reviewIndex = updatedReviews.findIndex((r) => r.id === replyReviewId);
      updatedReviews[reviewIndex].replies.push(response.data);
      setReviewsList(updatedReviews);
      setReplyText('');
      setIsReplyModalVisible(false);
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const totalStars = 5;
  
    const ratingPercentage = (rating / totalStars) * 100;

    return (
      <div className="relative flex items-center">
        <div
          className="absolute inset-0 flex"
          style={{
            width: `${ratingPercentage}%`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          }}
        >
          {[...Array(totalStars)].map((_, i) => (
            <span key={i} className="text-transparent text-yellow-500">★</span>
          ))}
        </div>
        <div className="relative flex z-10">
          {[...Array(totalStars)].map((_, i) => (
            <span key={i} className="text-transparent">★</span>
          ))}
        </div>
      </div>
    );
  };

  const paginatedReviews = reviewsList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="flex flex-col items-start space-y-6">
      <div className="bg-white p-6 rounded-md shadow-sm border w-full">
        <h3 className="text-xl font-semibold mb-4 text-teal-600">Average Rating</h3>
        <div className="flex items-center space-x-1">
          {renderStars(averageRating)} {averageRating.toFixed(1)}
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-sm border w-full">
        <h3 className="text-xl font-semibold mb-4 text-teal-600">Reviews & Ratings</h3>
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <div key={review.id} className="flex flex-col w-full items-start space-x-4 border-b border-gray-200 pb-4">
            <div className="flex items-start space-x-4 w-full border-b border-gray-200 pb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">{review.from_user_username[0]}</span>
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm font-semibold">{review.from_user_username}</p>
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                </div>
                <p className="text-gray-600 text-sm mt-2">{review.feedback}</p>
                <div className="mt-1">
                  <span
                  onClick={() => handleReplyClick(review.id)}
                  
                  className='text-sm border-none hover:text-teal-400 flex items-center gap-1 text-gray-400 cursor-pointer'
                  >
                  <GoReply/>
                  Reply
                  </span>
                </div>
                </div>
                </div>
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-2 pl-6 w-full">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="text-sm text-gray-600 w-full flex items-start gap-2">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{reply.from_user_username[0]}</span>
                    </div>
                    <div className="flex flex-col w-full">
                      <p className="text-sm font-semibold">{reply.from_user_username}</p>
                      <p className="text-gray-600 text-sm mt-2">{reply.feedback}</p>
                      
                      </div>
                       
                      </div>
                    ))}
                  </div>
                )}
              </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={reviewsList.length}
            onChange={handlePaginationChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      <Modal
        title="Reply to Review"
        open={isReplyModalVisible}
        onOk={handleReplySubmit}
        onCancel={() => setIsReplyModalVisible(false)}
        okText="Submit Reply"
        cancelText="Cancel"
      >
        <Input.TextArea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply here"
          rows={4}
        />
      </Modal>

      
    </div>
  );
};

export default ReviewsRatings;
