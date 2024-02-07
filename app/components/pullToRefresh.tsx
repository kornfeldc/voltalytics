"use client";
import React, {useCallback, useEffect, useRef, useState} from "react";

export default function PullToRefresh() {
    const pullThreshold = 50; // Threshold in pixels for triggering refresh
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const touchInProgressRef = useRef(false);

    const onTouchStart = useCallback((event: any) => {
        touchInProgressRef.current = true;
        setTouchStart(event.touches[0].clientY);
    }, []);

    const onTouchMove = useCallback((event: any) => {
        if (touchInProgressRef.current) {
            setTouchEnd(event.touches[0].clientY);
        }
    }, []);

    const onTouchEnd = useCallback(() => {
        if (touchEnd - touchStart > pullThreshold) {
            window.location.reload();
        }
        touchInProgressRef.current = false;
    }, [touchEnd, touchStart, pullThreshold]);

    useEffect(() => {
        window.addEventListener('touchstart', onTouchStart);
        window.addEventListener('touchmove', onTouchMove, {passive: false});
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [onTouchStart, onTouchMove, onTouchEnd]);

    return (<></>);
}
