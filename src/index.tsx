import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { css } from '@emotion/css';
import { useDebounceFn, useUpdate } from 'ahooks';
import { CSSInterpolation } from '@emotion/css/dist/declarations/src/create-instance';

interface ShapeSize {
    height: number;
    width: number;
}

interface Position {
    /**
     * @description The direction of the position
     */
    direction: 'horizontal' | 'vertical';
    /**
     * @description The distance from the origin of the container with specified `direction`
     */
    distance: number;
}

export interface ScrollerCoasterTrackProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * @description The mode of showing the track
     * @default 'scrolling'
     */
    showMode?: 'always' | 'hover' | 'scrolling';
    /**
     * @default 12
     */
    size?: number;
    /**
     * @description Thumb props
     * @type React.HTMLAttributes<HTMLDivElement>
     */
    thumbProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface ScrollerCoasterProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * @description The maximum speed of scroll when dragging in container, in px/frame
     * @default 15
     */
    draggingScrollMaximumSpeed?: number;
    /**
     * @description The maximum threshold size of scroll when dragging in container, in px
     * @default 50
     */
    draggingScrollThreshold?: number;
    /**
     * @description Horizontal track props
     * @type ScrollerCoasterTrackProps
     */
    horizontalTrackProps?: ScrollerCoasterTrackProps;
    /**
     * @description Vertical track props
     * @type ScrollerCoasterTrackProps
     */
    verticalTrackProps?: ScrollerCoasterTrackProps;
}

export const ScrollerCoaster = React.forwardRef<HTMLDivElement, ScrollerCoasterProps>(
    (
        {
            children,
            horizontalTrackProps,
            verticalTrackProps,
            draggingScrollMaximumSpeed = 15,
            draggingScrollThreshold = 50,
            ...scrollerCoasterProps
        },
        outerRef,
    ) => {
        const update = useUpdate();
        const innerRef = useRef<HTMLDivElement | null>(null);
        const scrollHeightRef = useRef<number>(0);
        const scrollWidthRef = useRef<number>(0);
        const shapeSizeRef = useRef<ShapeSize | null>(null);
        const scrollTopRef = useRef<number>(0);
        const scrollLeftRef = useRef<number>(0);
        const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
        const verticalTrackRef = useRef<HTMLDivElement | null>(null);
        const horizontalThumbRef = useRef<HTMLDivElement | null>(null);
        const verticalThumbRef = useRef<HTMLDivElement | null>(null);
        const lastPositionRef = useRef<Position | null>(null);
        const [hovering, setHovering] = useState<boolean>(false);
        const [scrolling, setScrolling] = useState<boolean>(false);

        const isLegalPosition = useCallback(() => {
            return (
                lastPositionRef.current !== null &&
                (['horizontal', 'vertical'] as Array<Position['direction']>).includes(
                    lastPositionRef.current.direction,
                ) &&
                lastPositionRef.current.distance >= 0
            );
        }, [lastPositionRef.current]);

        const getTrackHtmlProps = useCallback((props: ScrollerCoasterTrackProps) => {
            return _.omit(props, ['thumbProps', 'size', 'showMode']);
        }, []);

        const getTrackShowState = useCallback(
            (variant: 'horizontal' | 'vertical') => {
                if (lastPositionRef.current?.direction === variant) return true;

                let trackProps: ScrollerCoasterTrackProps;

                switch (variant) {
                    case 'horizontal': {
                        trackProps = horizontalTrackProps;
                        break;
                    }
                    case 'vertical': {
                        trackProps = verticalTrackProps;
                        break;
                    }
                }

                if (scrolling || trackProps?.showMode === 'always' || (trackProps?.showMode === 'hover' && hovering)) {
                    return true;
                }

                return false;
            },
            [horizontalTrackProps, verticalTrackProps, hovering, scrolling, lastPositionRef.current],
        );

        const getTrackStyles = useCallback<(variant: 'horizontal' | 'vertical') => CSSInterpolation>(
            (variant) => {
                if (
                    !(scrollWidthRef.current > 0) ||
                    !(scrollHeightRef.current > 0) ||
                    !(shapeSizeRef.current?.width > 0) ||
                    !(shapeSizeRef.current?.height > 0)
                ) {
                    return {
                        display: 'none',
                        position: 'absolute',
                        overflow: 'hidden',
                    };
                }
                return {
                    position: 'absolute',
                    transition: 'opacity 0.3s ease-in-out',
                    overflow: 'hidden',
                    opacity: getTrackShowState(variant) ? 1 : 0,
                    ...(() => {
                        switch (variant) {
                            case 'horizontal': {
                                return {
                                    ...(() => {
                                        if (scrollWidthRef.current <= shapeSizeRef.current.width) {
                                            return {
                                                display: 'none',
                                            };
                                        }
                                    })(),
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: shapeSizeRef.current.width,
                                    height: horizontalTrackProps?.size ?? 12,
                                };
                            }
                            case 'vertical': {
                                return {
                                    ...(() => {
                                        if (scrollHeightRef.current <= shapeSizeRef.current.height) {
                                            return {
                                                display: 'none',
                                            };
                                        }
                                    })(),
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                    height: shapeSizeRef.current.height,
                                    width: verticalTrackProps?.size ?? 12,
                                };
                            }
                        }
                    })(),
                };
            },
            [
                horizontalTrackProps,
                verticalTrackProps,
                scrollWidthRef.current,
                scrollHeightRef.current,
                shapeSizeRef.current,
                scrolling,
                hovering,
            ],
        );

        const getThumbStyles = useCallback<(variant: 'horizontal' | 'vertical') => CSSInterpolation>(
            (variant) => {
                if (
                    !(shapeSizeRef.current?.height > 0) ||
                    !(shapeSizeRef.current?.width > 0) ||
                    !(scrollHeightRef.current > 0)
                ) {
                    return {};
                }
                return {
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    ...(variant === 'horizontal'
                        ? {
                              height: '100%',
                              top: 0,
                              bottom: 0,
                              width: (shapeSizeRef.current.width / scrollWidthRef.current) * shapeSizeRef.current.width,
                          }
                        : {}),
                    ...(variant === 'vertical'
                        ? {
                              width: '100%',
                              left: 0,
                              right: 0,
                              height:
                                  (shapeSizeRef.current.height / scrollHeightRef.current) * shapeSizeRef.current.height,
                          }
                        : {}),
                };
            },
            [
                horizontalTrackProps,
                verticalTrackProps,
                shapeSizeRef.current,
                scrollHeightRef.current,
                scrollWidthRef.current,
            ],
        );

        const calculateScrollSpeed = useCallback(
            (distance: number, scrollingBack = false) => {
                const result = Math.min(
                    ((draggingScrollThreshold - distance) / draggingScrollThreshold) * draggingScrollMaximumSpeed,
                    draggingScrollMaximumSpeed,
                );
                return scrollingBack ? 0 - result : result;
            },
            [draggingScrollMaximumSpeed, draggingScrollThreshold],
        );

        const clearScrolling = useDebounceFn(
            () => {
                setScrolling(false);
            },
            { wait: 1000 },
        );

        useImperativeHandle(outerRef, () => innerRef.current);

        useEffect(() => {
            setScrolling(true);
        }, [scrollLeftRef.current, scrollTopRef.current]);

        useEffect(() => {
            if (scrolling === false) return;
            clearScrolling.run();
        }, [scrolling]);

        useEffect(() => {
            if (!(innerRef.current instanceof HTMLElement)) return;

            const observerHandler = () => {
                let changed = false;

                if (scrollHeightRef.current !== innerRef.current.scrollHeight) {
                    scrollHeightRef.current = innerRef.current.scrollHeight;
                    changed = true;
                }

                if (scrollWidthRef.current !== innerRef.current.scrollWidth) {
                    scrollWidthRef.current = innerRef.current.scrollWidth;
                    changed = true;
                }

                if (
                    shapeSizeRef.current?.height !== innerRef.current.clientHeight ||
                    shapeSizeRef.current?.width !== innerRef.current.clientWidth
                ) {
                    shapeSizeRef.current = {
                        height: innerRef.current.clientHeight,
                        width: innerRef.current.clientWidth,
                    };
                    changed = true;
                }

                if (changed) {
                    update();
                }
            };

            const mutationObserver = new MutationObserver(observerHandler);
            const resizeObserver = new ResizeObserver(observerHandler);

            observerHandler();

            mutationObserver.observe(innerRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
                attributeOldValue: true,
                characterDataOldValue: true,
            });
            resizeObserver.observe(innerRef.current);

            const mouseEnterHandler = () => {
                setHovering(true);
            };

            const mouseLeaveHandler = () => {
                setHovering(false);
            };

            innerRef.current.addEventListener('mouseenter', mouseEnterHandler, true);
            innerRef.current.addEventListener('mouseleave', mouseLeaveHandler, true);

            return () => {
                mutationObserver.disconnect();
                resizeObserver.disconnect();
                innerRef.current.removeEventListener('mouseenter', mouseEnterHandler, true);
                innerRef.current.removeEventListener('mouseleave', mouseLeaveHandler, true);
            };
        }, [
            innerRef.current,
            scrollHeightRef.current,
            scrollWidthRef.current,
            shapeSizeRef.current,
            verticalTrackRef.current,
            horizontalThumbRef.current,
        ]);

        useEffect(() => {
            if (
                !(innerRef.current instanceof HTMLElement) ||
                !(scrollHeightRef.current > 0) ||
                !(scrollWidthRef.current > 0) ||
                !(shapeSizeRef.current?.height > 0) ||
                !(shapeSizeRef.current?.width > 0)
            ) {
                return;
            }

            const wheelHandler = (event: WheelEvent) => {
                event.stopPropagation();
                event.preventDefault();

                requestAnimationFrame(() => {
                    const maxScrollTop = scrollHeightRef.current - shapeSizeRef.current.height;
                    const maxScrollLeft = scrollWidthRef.current - shapeSizeRef.current.width;

                    let newScrollTop = scrollTopRef.current + event.deltaY;
                    let newScrollLeft = scrollLeftRef.current + event.deltaX;

                    if (newScrollTop < 0) {
                        newScrollTop = 0;
                    } else if (newScrollTop > maxScrollTop) {
                        newScrollTop = maxScrollTop;
                    }

                    if (newScrollLeft < 0) {
                        newScrollLeft = 0;
                    } else if (newScrollLeft > maxScrollLeft) {
                        newScrollLeft = maxScrollLeft;
                    }

                    if (scrollTopRef.current !== newScrollTop || scrollLeftRef.current !== newScrollLeft) {
                        scrollTopRef.current = newScrollTop;
                        scrollLeftRef.current = newScrollLeft;
                        update();
                    }
                });
            };

            innerRef.current.addEventListener('wheel', wheelHandler, { passive: false });

            return () => {
                innerRef.current.removeEventListener('wheel', wheelHandler);
            };
        }, [
            innerRef.current,
            scrollTopRef.current,
            scrollLeftRef.current,
            scrollHeightRef.current,
            scrollWidthRef.current,
            shapeSizeRef.current,
        ]);

        useEffect(() => {
            if (
                !(innerRef.current instanceof HTMLElement) ||
                !(shapeSizeRef.current?.height > 0) ||
                !(shapeSizeRef.current?.width > 0)
            ) {
                return;
            }

            if (horizontalTrackRef.current instanceof HTMLElement) {
                const horizontalThumbLeft =
                    (scrollLeftRef.current / scrollWidthRef.current) * shapeSizeRef.current.width;
                horizontalThumbRef.current.style.left = `${horizontalThumbLeft}px`;
                horizontalTrackRef.current.style.top = `${shapeSizeRef.current.height + scrollTopRef.current - horizontalTrackRef.current.clientHeight}px`;
                horizontalTrackRef.current.style.left = `${scrollLeftRef.current}px`;
            }

            if (verticalTrackRef.current instanceof HTMLElement) {
                const verticalThumbTop = (scrollTopRef.current / scrollHeightRef.current) * shapeSizeRef.current.height;
                verticalThumbRef.current.style.top = `${verticalThumbTop}px`;
                verticalTrackRef.current.style.left = `${shapeSizeRef.current.width + scrollLeftRef.current - verticalTrackRef.current.clientWidth}px`;
                verticalTrackRef.current.style.top = `${scrollTopRef.current}px`;
            }

            innerRef.current.scrollTo({ top: scrollTopRef.current, left: scrollLeftRef.current, behavior: 'instant' });
        }, [
            scrollTopRef.current,
            scrollLeftRef.current,
            horizontalTrackRef.current,
            verticalTrackRef.current,
            innerRef.current,
            shapeSizeRef.current,
            verticalThumbRef.current,
            horizontalThumbRef.current,
        ]);

        useEffect(() => {
            if (!(innerRef.current instanceof HTMLElement)) return;

            let scrollAnimationId: number;
            let scrollSpeed = 0;
            let directions: Array<'horizontal' | 'vertical'> | false = false;

            const mouseMoveHandler = (event: MouseEvent) => {
                if (directions === false) return;

                const containerRect = innerRef.current.getBoundingClientRect();
                const distanceFromTop = event.clientY - containerRect.top;
                const distanceFromBottom = containerRect.bottom - event.clientY;
                const distanceFromLeft = event.clientX - containerRect.left;
                const distanceFromRight = containerRect.right - event.clientX;

                if (distanceFromBottom < draggingScrollThreshold || distanceFromTop < draggingScrollThreshold) {
                    directions.push('vertical');
                    if (distanceFromBottom < draggingScrollThreshold) {
                        scrollSpeed = calculateScrollSpeed(distanceFromBottom);
                    } else if (distanceFromTop < draggingScrollThreshold) {
                        scrollSpeed = calculateScrollSpeed(distanceFromTop, true);
                    } else {
                        scrollSpeed = 0;
                    }
                } else {
                    directions = directions.filter((direction) => direction !== 'vertical');
                }

                if (distanceFromLeft < draggingScrollThreshold || distanceFromRight < draggingScrollThreshold) {
                    directions.push('horizontal');
                    if (distanceFromRight < draggingScrollThreshold) {
                        scrollSpeed = calculateScrollSpeed(distanceFromRight);
                    } else if (distanceFromLeft < draggingScrollThreshold) {
                        scrollSpeed = calculateScrollSpeed(distanceFromLeft, true);
                    } else {
                        scrollSpeed = 0;
                    }
                } else {
                    directions = directions.filter((direction) => direction !== 'horizontal');
                }

                const scrollAnimation = () => {
                    if (directions === false) return;

                    if (innerRef.current instanceof HTMLElement && directions.length > 0) {
                        if (directions.includes('vertical')) {
                            const newScrollTop = scrollTopRef.current + scrollSpeed;

                            if (
                                newScrollTop >= 0 &&
                                newScrollTop <= scrollHeightRef.current - shapeSizeRef.current?.height
                            ) {
                                scrollTopRef.current = newScrollTop;
                                update();
                            }
                        }
                        if (directions.includes('horizontal')) {
                            const newScrollLeft = scrollLeftRef.current + scrollSpeed;

                            if (
                                newScrollLeft >= 0 &&
                                newScrollLeft <= scrollWidthRef.current - shapeSizeRef.current?.width
                            ) {
                                scrollLeftRef.current = newScrollLeft;
                                update();
                            }
                        }
                    }
                };

                scrollAnimationId = requestAnimationFrame(scrollAnimation);
            };

            const mouseDownHandler = (event: MouseEvent) => {
                if (
                    event.target === horizontalThumbRef.current ||
                    event.target === verticalThumbRef.current ||
                    event.target === horizontalTrackRef.current ||
                    event.target === verticalTrackRef.current
                ) {
                    return;
                }
                directions = [];
            };

            const mouseUpHandler = () => {
                directions = false;
                scrollSpeed = 0;
                if (typeof scrollAnimationId === 'number') {
                    cancelAnimationFrame(scrollAnimationId);
                    scrollAnimationId = null;
                }
            };

            innerRef.current.addEventListener('mousedown', mouseDownHandler, true);
            document.addEventListener('mousemove', mouseMoveHandler, true);
            document.addEventListener('mouseup', mouseUpHandler, true);

            return () => {
                if (scrollAnimationId) {
                    cancelAnimationFrame(scrollAnimationId);
                }
                innerRef.current?.removeEventListener('mousedown', mouseDownHandler, true);
                document.removeEventListener('mousemove', mouseMoveHandler, true);
                document.removeEventListener('mouseup', mouseUpHandler, true);
            };
        }, [
            innerRef.current,
            draggingScrollMaximumSpeed,
            draggingScrollThreshold,
            scrollHeightRef.current,
            scrollWidthRef.current,
            shapeSizeRef.current,
            horizontalThumbRef.current,
            verticalThumbRef.current,
            horizontalTrackRef.current,
            verticalTrackRef.current,
        ]);

        useEffect(() => {
            const mouseDownHandler = (event: MouseEvent) => {
                event.stopPropagation();
                event.preventDefault();

                let direction: Position['direction'] = null;
                let distance: number = 0;

                if (event.target === verticalThumbRef.current) {
                    direction = 'vertical';
                    distance = event.clientY;
                } else if (event.target === horizontalThumbRef.current) {
                    direction = 'horizontal';
                    distance = event.clientX;
                }

                if (!(['vertical', 'horizontal'] as Array<Position['direction']>).includes(direction)) return;

                lastPositionRef.current = {
                    direction,
                    distance,
                };

                update();
            };

            const mouseUpHandler = (event: MouseEvent) => {
                event.stopPropagation();
                event.preventDefault();
                lastPositionRef.current = null;
                update();
            };

            const mouseMoveHandler = (event: MouseEvent) => {
                event.stopPropagation();
                event.preventDefault();

                if (
                    !isLegalPosition() ||
                    !(shapeSizeRef.current?.height > 0) ||
                    !(shapeSizeRef.current?.width > 0) ||
                    !(scrollHeightRef.current > 0)
                ) {
                    return;
                }

                let currentDistance: number = 0;
                let scrollSize: number = 0;
                let legendShapeSize: number = 0;
                let scrollDistance: number = 0;

                switch (lastPositionRef.current.direction) {
                    case 'vertical':
                        currentDistance = event.clientY;
                        scrollSize = scrollHeightRef.current;
                        legendShapeSize = shapeSizeRef.current.height;
                        scrollDistance = scrollTopRef.current;
                        break;
                    case 'horizontal':
                        currentDistance = event.clientX;
                        scrollSize = scrollWidthRef.current;
                        legendShapeSize = shapeSizeRef.current.width;
                        scrollDistance = scrollLeftRef.current;
                        break;
                }

                let newScrollDistance =
                    scrollDistance +
                    (currentDistance - lastPositionRef.current.distance) * (scrollSize / legendShapeSize);

                if (newScrollDistance < 0) {
                    newScrollDistance = 0;
                } else if (newScrollDistance > scrollSize - legendShapeSize) {
                    newScrollDistance = scrollSize - legendShapeSize;
                }

                switch (lastPositionRef.current.direction) {
                    case 'vertical':
                        scrollTopRef.current = newScrollDistance;
                        break;
                    case 'horizontal':
                        scrollLeftRef.current = newScrollDistance;
                        break;
                }

                lastPositionRef.current = {
                    direction: lastPositionRef.current.direction,
                    distance: currentDistance,
                };

                update();
            };

            verticalThumbRef.current.addEventListener('mousedown', mouseDownHandler, true);
            horizontalThumbRef.current.addEventListener('mousedown', mouseDownHandler, true);
            document.addEventListener('mouseup', mouseUpHandler, true);
            document.addEventListener('mousemove', mouseMoveHandler, true);

            return () => {
                verticalThumbRef.current.removeEventListener('mousedown', mouseDownHandler, true);
                horizontalThumbRef.current.removeEventListener('mousedown', mouseDownHandler, true);
                document.removeEventListener('mouseup', mouseUpHandler, true);
                document.removeEventListener('mousemove', mouseMoveHandler, true);
            };
        }, [
            verticalThumbRef.current,
            horizontalThumbRef.current,
            scrollHeightRef.current,
            scrollWidthRef.current,
            scrollLeftRef.current,
            scrollTopRef.current,
            shapeSizeRef.current,
            lastPositionRef.current,
            shapeSizeRef.current,
        ]);

        return (
            <div
                {...scrollerCoasterProps}
                ref={innerRef}
                className={clsx(
                    css({
                        position: 'relative',
                    }),
                    scrollerCoasterProps?.className,
                    css({
                        overflow: 'hidden',
                        /* Hide scrollbar in FireFox */
                        scrollbarWidth: 'none',
                        /* Hide scrollbar in Edge/IE */
                        msOverflowStyle: 'none',
                        /* Hide scrollbar in Chrome/Safari */
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                    }),
                )}
            >
                {children}
                {/* If passed value of `horizontalTrackProps` is `false`, then hide the whole horizontal track */}
                <div
                    // Omit the `thumbProps` to prevent getting warnings from React
                    {...getTrackHtmlProps(horizontalTrackProps)}
                    ref={horizontalTrackRef}
                    className={clsx(css(getTrackStyles('horizontal')), horizontalTrackProps?.className)}
                >
                    <div
                        {...horizontalTrackProps?.thumbProps}
                        ref={horizontalThumbRef}
                        className={clsx(css(getThumbStyles('horizontal')), horizontalTrackProps?.thumbProps?.className)}
                    />
                </div>
                <div
                    {...getTrackHtmlProps(verticalTrackProps)}
                    ref={verticalTrackRef}
                    className={clsx(css(getTrackStyles('vertical')), verticalTrackProps?.className)}
                >
                    <div
                        {...verticalTrackProps?.thumbProps}
                        ref={verticalThumbRef}
                        className={clsx(css(getThumbStyles('vertical')), verticalTrackProps?.thumbProps?.className)}
                    />
                </div>
            </div>
        );
    },
);
