import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaCopy, FaSync, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { useGetReviewByIdQuery, useUpdateUsedReviewMutation } from '../../project/superadmin/module/reviews/services/reviewsApi';
import './companyReviews.scss';
import logo from '../../assests/images/logo.png';

const DEFAULT_REVIEW = "it's a good company";

// Generate Google review link from Place ID
const generateReviewLink = (placeId) => {
    if (!placeId) return 'https://www.google.com';
    return `https://search.google.com/local/writereview?placeid=${placeId}&source=g.page.m.nr._&laa=nmx-review-solicitation-recommendation-card`;
};

const CompanyReviews = () => {
    const { companyName, id } = useParams();
    const navigate = useNavigate();
    const { data: reviewResponse, isLoading: apiLoading, error, refetch } = useGetReviewByIdQuery(id);
    const [updateUsedReview] = useUpdateUsedReviewMutation();
    const [copied, setCopied] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [contentReady, setContentReady] = useState(true);

    // Verify that the company name in URL matches the review's company
    useEffect(() => {
        if (reviewResponse?.success && reviewResponse.data) {
            const urlCompanyName = decodeURIComponent(companyName);
            const reviewCompanyName = reviewResponse.data.companyName.replace(/\s+/g, '-').toLowerCase();

            if (urlCompanyName !== reviewCompanyName) {
                navigate(`/reviews/${reviewCompanyName}/${id}`, { replace: true });
            }
        }
    }, [reviewResponse, companyName, id, navigate]);

    const handleCopyReview = async (review) => {
        try {
            if (review.review) {
                // Copy to clipboard FIRST
                await navigator.clipboard.writeText(review.review);
                setCopied(true);
                
                // Open window immediately after copy (must be synchronous for Safari)
                const reviewLink = generateReviewLink(review.placeId);
                window.open(reviewLink, '_blank');

                // Update used review in background
                updateUsedReview({
                    id: review.id,
                    data: {
                        index: review.index,
                        review: review.review
                    }
                }).unwrap().catch(err => console.error('Failed to update used review:', err));

                // Reset copied state after a short delay
                setTimeout(() => {
                    setCopied(false);
                    refetch();
                }, 500);
            } else {
                console.error('No valid review available');
            }
        } catch (error) {
            console.error('Error handling review:', error);
            setCopied(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);

        try {
            // Immediately refetch without animations or delays
            const result = await refetch();

            // If there's an error or no data, show a message
            if (result.error) {
                console.error('Error refreshing review:', result.error);
            }
        } catch (error) {
            console.error('Error during refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderStars = () => {
        return Array(5).fill(0).map((_, index) => (
            <FaStar key={index} className="star-icon" />
        ));
    };

    const renderParticles = () => {
        return Array(20).fill(0).map((_, index) => (
            <div key={index} className="particle"></div>
        ));
    };

    // Render the expired plan message
    const renderExpiredPlanMessage = () => {
        const displayCompanyName = decodeURIComponent(companyName).replace(/-/g, ' ');

        return (
            <>
                <div className="particles">
                    {renderParticles()}
                </div>

                <motion.div
                    className="review-header"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2>{displayCompanyName}</h2>
                </motion.div>

                <motion.div
                    className="expired-plan-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="expired-icon">
                        <FaExclamationTriangle />
                    </div>

                    <h3>Subscription Expired</h3>

                    <p>
                        This company's review service is currently unavailable as the subscription plan has expired.
                    </p>

                    <p className="contact-info">
                        Please contact the company administrator to renew the subscription.
                    </p>
                </motion.div>

                <motion.div
                    className="company-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.8,
                        ease: "easeOut"
                    }}
                >
                    <div className="footer-branding">
                        <motion.div
                            className="ai-powered"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <span>AI</span>
                            <span className="diamond">◈</span>
                            <span>Powered</span>
                        </motion.div>

                        <div className="company-logo">
                            <div className="logo-with-text">
                                <motion.div
                                    className="logo-container"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 1.2,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                >
                                    <img src={logo} alt="Infofriends" className="logo-icon" />
                                    <div className="glow-effect"></div>
                                </motion.div>

                                <div className="text-container">
                                    <motion.span
                                        className="logo-text"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 1.4 }}
                                    >
                                        Infofriends
                                    </motion.span>
                                    <motion.span
                                        className="tagline-text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 1.6 }}
                                    >
                                        Technology
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    };

    // Render 404 error page
    const render404Page = () => {
        return (
            <>
                <div className="particles">
                    {renderParticles()}
                </div>

                <motion.div
                    className="error-404-card"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="error-icon">
                        <FaExclamationCircle />
                    </div>

                    <h2>404</h2>
                    <h3>Page Not Found</h3>

                    <p>
                        The review page you are looking for doesn't exist or has been removed.
                    </p>

                    <motion.button
                        className="primary-button"
                        onClick={() => window.location.href = '/'}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go to Homepage
                    </motion.button>
                </motion.div>

                <motion.div
                    className="company-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.8,
                        ease: "easeOut"
                    }}
                >
                    <div className="footer-branding">
                        <div className="company-logo">
                            <div className="logo-with-text">
                                <motion.div
                                    className="logo-container"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 1.2,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                >
                                    <img src={logo} alt="Infofriyends" className="logo-icon" />
                                </motion.div>

                                <div className="text-container">
                                    <motion.span
                                        className="logo-text"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 1.4 }}
                                    >
                                        Infofriyends
                                    </motion.span>
                                    <motion.span
                                        className="tagline-text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 1.6 }}
                                    >
                                        Technology
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    };

    // Prepare content component
    const renderContent = () => {
        // Check for API errors first
        if (error) {
            // If it's a 404 error or the API doesn't exist
            if (error.status === 404 || error?.data?.message?.includes("not found") || error?.message?.includes("Failed to fetch")) {
                return render404Page();
            }

            if (error?.data?.message === "No more reviews available") {
                return (
                    <>
                        <div className="particles">
                            {renderParticles()}
                        </div>

                        <motion.div
                            className="review-header"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2>{decodeURIComponent(companyName).replace(/-/g, ' ')}</h2>
                        </motion.div>

                        <motion.div
                            className="review-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="card-header">
                                <button
                                    className="refresh-button"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    title="Get another review"
                                >
                                    <FaSync className={refreshing ? "spinning" : ""} />
                                </button>
                            </div>

                            <div className="review-content">
                                <div className="rating-container">
                                    {renderStars()}
                                </div>
                                <p className="review-text">
                                    {DEFAULT_REVIEW}
                                </p>
                            </div>

                            <div className="card-footer">
                                <button
                                    className={`copy-button ${copied ? 'copied' : ''}`}
                                    onClick={() => handleCopyReview({
                                        review: DEFAULT_REVIEW,
                                        googleReviewLink: reviewResponse?.data?.googleReviewLink || 'https://www.google.com'
                                    })}
                                    disabled={copied}
                                >
                                    <FaCopy className="button-icon" />
                                    {copied ? 'Opening Google...' : 'Copy & Review on Google'}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            className="footer-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            Thank you for your feedback!
                        </motion.div>

                        <motion.div
                            className="company-footer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 0.8,
                                ease: "easeOut"
                            }}
                        >
                            <div className="footer-branding">
                                <motion.div
                                    className="ai-powered"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 1.0 }}
                                >
                                    <span>AI</span>
                                    <span className="diamond">◈</span>
                                    <span>Powered</span>
                                </motion.div>

                                <div className="company-logo">
                                    <div className="logo-with-text">
                                        <motion.div
                                            className="logo-container"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 1.2,
                                                type: "spring",
                                                stiffness: 200
                                            }}
                                        >
                                            <img src={logo} alt="Infofriyends" className="logo-icon" />
                                            <div className="glow-effect"></div>
                                        </motion.div>

                                        <div className="text-container">
                                            <motion.span
                                                className="logo-text"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.5, delay: 1.4 }}
                                            >
                                                Infofriyends
                                            </motion.span>
                                            <motion.span
                                                className="tagline-text"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5, delay: 1.6 }}
                                            >
                                                Technology
                                            </motion.span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                );
            }

            // For other errors, show the generic error card
            return (
                <>
                    <div className="particles">
                        {renderParticles()}
                    </div>

                    <motion.div
                        className="error-card"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3>Error</h3>
                        <p>
                            {error.message || "Something went wrong. Please try again later."}
                        </p>
                        <motion.button
                            className="primary-button"
                            onClick={() => window.location.reload()}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Refresh Page
                        </motion.button>
                    </motion.div>
                </>
            );
        }

        // If no data is returned, show 404 page
        if (!reviewResponse?.success || !reviewResponse.data) {
            return render404Page();
        }

        const review = reviewResponse.data;

        // Check if company is inactive (subscription expired)
        if (review.companyStatus === 'inactive') {
            return renderExpiredPlanMessage();
        }

        // Convert any 'trial' status to 'unpaid' for display consistency
        if (review.paymentStatus === 'trial') {
            review.paymentStatus = 'unpaid';
        }

        const reviewText = review.review || DEFAULT_REVIEW;
        const displayCompanyName = decodeURIComponent(companyName).replace(/-/g, ' ');

        return (
            <>
                <div className="particles">
                    {renderParticles()}
                </div>

                <motion.div
                    className="review-header"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2>{displayCompanyName}</h2>
                </motion.div>

                <motion.div
                    className="review-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="card-header">
                        <motion.button
                            className="refresh-button"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Get another review"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FaSync className={refreshing ? "spinning" : ""} />
                        </motion.button>
                    </div>

                    <div className="review-content">
                        <motion.div
                            className="rating-container"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            {renderStars()}
                        </motion.div>

                        <motion.p
                            className="review-text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            {reviewText}
                        </motion.p>

                        <div className="quote-marks"></div>
                    </div>

                    <div className="card-footer">
                        <div className="button-wrapper">
                            <motion.button
                                className={`copy-button ${copied ? 'copied' : ''}`}
                                onClick={() => handleCopyReview(review)}
                                disabled={copied}
                                whileHover={!copied ? { scale: 1.03 } : {}}
                                whileTap={!copied ? { scale: 0.97 } : {}}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <FaCopy className="button-icon" />
                                <div className="button-text">
                                    {copied ? (
                                        <>
                                            Opening Google
                                            <span className="loading-dots">
                                                <span className="dot">.</span>
                                                <span className="dot">.</span>
                                                <span className="dot">.</span>
                                            </span>
                                        </>
                                    ) : 'Copy & Review on Google'}
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="footer-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    Thank you for your feedback!
                </motion.div>

                <motion.div
                    className="company-footer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.8,
                        ease: "easeOut"
                    }}
                >
                    <div className="footer-branding">
                        <motion.div
                            className="ai-powered"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                        >
                            <span>AI</span>
                            <span className="diamond">◈</span>
                            <span>Powered</span>
                        </motion.div>

                        <div className="company-logo">
                            <div className="logo-with-text">
                                <motion.div
                                    className="logo-container"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: 1.2,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                >
                                    <img src={logo} alt="Infofriyends" className="logo-icon" />
                                    <div className="glow-effect"></div>
                                </motion.div>

                                <div className="text-container">
                                    <motion.span
                                        className="logo-text"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 1.4 }}
                                    >
                                        Infofriyends
                                    </motion.span>
                                    <motion.span
                                        className="tagline-text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 1.6 }}
                                    >
                                        Technology
                                    </motion.span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </>
        );
    };

    // Main render with AnimatePresence for smooth transitions
    return (
        <div className="public-reviews-container">
            {/* Content container - show immediately */}
            <motion.div
                className="content-container"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
            >
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default CompanyReviews; 