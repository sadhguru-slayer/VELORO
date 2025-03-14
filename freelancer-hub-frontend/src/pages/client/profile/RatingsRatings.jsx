import React, { useState, useEffect } from 'react';
import { Button, Pagination, Input, Modal, Progress, Tooltip, Empty } from 'antd';
import { GoReply } from "react-icons/go";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';

const ReviewsRatings = ({userId, role}) => {
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState(false);
  const pageSize = 5;
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const accessToken = Cookies.get('accessToken');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/client/get_reviews', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data;
        
        setReviewsList(data.reviews);
        setAverageRating(data.average_rating);

        // Calculate rating statistics
        const stats = data.reviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, {5: 0, 4: 0, 3: 0, 2: 0, 1: 0});
        setRatingStats(stats);
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

  const renderStars = (rating) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= rating) {
          return <FaStar key={star} className="text-yellow-400" />;
        } else if (star - 0.5 <= rating) {
          return <FaStarHalfAlt key={star} className="text-yellow-400" />;
        }
        return <FaRegStar key={star} className="text-yellow-400" />;
      })}
    </div>
  );

  const filteredAndSortedReviews = () => {
    let filtered = [...reviewsList];
    
    if (filterRating) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return b.rating - a.rating;
    });
  };

  const paginatedReviews = filteredAndSortedReviews().slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  return (
    <div className="w-full min-h-fit max-w-[1200px] min-w-[320px]  mx-auto p-6 space-y-8">
      {/* Rating Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-2xl font-bold text-charcolBlue">Overall Rating</h3>
            <div className="text-5xl font-bold text-charcolBlue">
              {averageRating.toFixed(1)}
            </div>
            <div className="scale-150 my-4">
              {renderStars(averageRating)}
            </div>
            <p className="text-gray-500">Based on {reviewsList.length} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-charcolBlue mb-4">Rating Distribution</h3>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats[rating] || 0;
              const percentage = (count / reviewsList.length) * 100 || 0;
              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-20">
                    <FaStar className="text-yellow-400" />
                    <span className="text-gray-600">{rating}</span>
                  </div>
                  <Progress 
                    percent={percentage} 
                    strokeColor="#0d9488"
                    size="small" 
                    format={(percent) => `${count}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Reviews Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-charcolBlue">Reviews & Feedback</h3>
          <div className="flex gap-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <Tooltip key={rating} title={`${rating} Star Reviews`}>
                  <Button
                    type={filterRating === rating ? 'primary' : 'default'}
                    className={filterRating === rating ? 'bg-teal-500 border-none' : ''}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  >
                    {rating} ★
                  </Button>
                </Tooltip>
              ))}
            </div>
            {/* Sort Button */}
            <Button
              onClick={() => setSortBy(sortBy === 'recent' ? 'rating' : 'recent')}
              icon={<BiTime />}
            >
              Sort by {sortBy === 'recent' ? 'Rating' : 'Recent'}
            </Button>
          </div>
        </div>

        {/* Reviews List */}
        <AnimatePresence>
          {paginatedReviews.length > 0 ? (
            <div className="space-y-6">
              {paginatedReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {review.from_user_username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-charcolBlue">{review.from_user_username}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {moment(review.created_at).fromNow()}
                            </span>
                          </div>
                        </div>
                        <Button
                          icon={<GoReply />}
                          type="text"
                          className="text-teal-500 hover:text-teal-600"
                          onClick={() => handleReplyClick(review.id)}
                        >
                          Reply
                        </Button>
                      </div>
                      <p className="mt-3 text-gray-600">{review.feedback}</p>

                      {/* Replies Section */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                          {review.replies.map((reply) => (
                            <motion.div
                              key={reply.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white rounded-lg p-4 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-sm">
                                  {reply.from_user_username[0].toUpperCase()}
                                </div>
                                <div>
                                  <h5 className="font-medium text-charcolBlue">{reply.from_user_username}</h5>
                                  <p className="text-gray-600 mt-1">{reply.feedback}</p>
                                  <span className="text-xs text-gray-400 mt-2 block">
                                    {moment(reply.created_at).fromNow()}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty
              description="No reviews found"
              className="my-12"
            />
          )}
        </AnimatePresence>

        {/* Pagination */}
        <div className="mt-6 flex justify-end">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredAndSortedReviews().length}
            onChange={handlePaginationChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Enhanced Reply Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-charcolBlue">
            <GoReply className="text-teal-500" />
            <span>Reply to Review</span>
          </div>
        }
        open={isReplyModalVisible}
        onOk={handleReplySubmit}
        onCancel={() => setIsReplyModalVisible(false)}
        okText="Submit Reply"
        cancelText="Cancel"
        okButtonProps={{
          className: 'bg-teal-500 border-none hover:bg-teal-600'
        }}
      >
        <Input.TextArea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your thoughtful reply here..."
          rows={4}
          className="mt-4 resize-none"
        />
      </Modal>
    </div>
  );
};

export default ReviewsRatings;
