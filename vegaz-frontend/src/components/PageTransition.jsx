import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../index.css';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const [displayChildren, setDisplayChildren] = useState(children);
    const [transitionStage, setTransitionStage] = useState('fadeIn');

    // This effect runs whenever the route (location) changes
    useEffect(() => {
        // If the location changed, start by fading out
        if (location.pathname !== displayChildren.props?.location?.pathname) {
            setTransitionStage('fadeOut');
        }
    }, [location, displayChildren]);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* Global Loading Overlay representing the brief processing time */}
            {transitionStage === 'fadeOut' && (
                <div className="global-page-loader">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* The page itself with attached CSS transitions */}
            <div
                className={`page-transition ${transitionStage}`}
                onAnimationEnd={() => {
                    if (transitionStage === 'fadeOut') {
                        // Once faded out, swap the children to the newly navigated page
                        setDisplayChildren(children);
                        // Start fading the new page in
                        setTransitionStage('fadeIn');
                    }
                }}
            >
                {/* 
                  Cloning children and injecting current location so that 
                  React knows exactly when the DOM tree corresponds to the new page 
                 */}
                {React.cloneElement(displayChildren, { location })}
            </div>
        </div>
    );
};

export default PageTransition;
