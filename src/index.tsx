import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { css } from '@emotion/css';
import { useUpdate } from 'ahooks';
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
     * @type ScrollerCoasterTrackProps | false
     */
    horizontalTrackProps?: ScrollerCoasterTrackProps | false;
    position?: 'absolute' | 'relative';
    /**
     * @description Vertical track props
     * @type ScrollerCoasterTrackProps | false
     */
    verticalTrackProps?: ScrollerCoasterTrackProps | false;
}

export const ScrollerCoaster = React.forwardRef<HTMLDivElement, ScrollerCoasterProps>(
    (
        {
            children,
            position = 'relative',
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
            return _.omit(props, ['thumbProps', 'size']);
        }, []);

        const getTrackStyles = useCallback<(variant: 'horizontal' | 'vertical') => CSSInterpolation>(
            (variant) => {
                if (
                    horizontalTrackProps === false ||
                    verticalTrackProps === false ||
                    !(scrollWidthRef.current > 0) ||
                    !(scrollHeightRef.current > 0)
                ) {
                    return {};
                }
                return {
                    position: 'absolute',
                    ...(variant === 'horizontal'
                        ? {
                              left: 0,
                              right: 0,
                              bottom: 0,
                              width: scrollWidthRef.current,
                              height: horizontalTrackProps?.size ?? 12,
                          }
                        : {}),
                    ...(variant === 'vertical'
                        ? {
                              top: 0,
                              bottom: 0,
                              right: 0,
                              height: scrollHeightRef.current,
                              width: verticalTrackProps?.size ?? 12,
                          }
                        : {}),
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                };
            },
            [horizontalTrackProps, verticalTrackProps, scrollWidthRef.current, scrollHeightRef.current],
        );

        const getThumbStyles = useCallback<(variant: 'horizontal' | 'vertical') => CSSInterpolation>(
            (variant) => {
                if (
                    horizontalTrackProps === false ||
                    verticalTrackProps === false ||
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

        useImperativeHandle(outerRef, () => innerRef.current);

        useEffect(() => {
            if (!(innerRef.current instanceof HTMLElement)) return;

            const resizeObserver = new ResizeObserver(() => {
                scrollHeightRef.current = innerRef.current.scrollHeight;
                scrollWidthRef.current = innerRef.current.scrollWidth;
                shapeSizeRef.current = {
                    height: innerRef.current.clientHeight,
                    width: innerRef.current.clientWidth,
                };
                update();
            });

            resizeObserver.observe(innerRef.current);

            return () => {
                resizeObserver.disconnect();
            };
        }, [innerRef.current]);

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

                const newScrollTop = innerRef.current.scrollTop + event.deltaY;
                const newScrollLeft = innerRef.current.scrollLeft + event.deltaX;

                if (newScrollTop <= scrollHeightRef.current - shapeSizeRef.current.height) {
                    scrollTopRef.current = newScrollTop < 0 ? 0 : newScrollTop;
                }

                if (newScrollLeft <= scrollWidthRef.current - shapeSizeRef.current.width) {
                    scrollLeftRef.current = newScrollLeft < 0 ? 0 : newScrollLeft;
                }

                update();
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
                horizontalTrackRef.current.style.top = `${shapeSizeRef.current.height + scrollTopRef.current - horizontalTrackRef.current.clientHeight}px`;
            }

            if (verticalTrackRef.current instanceof HTMLElement) {
                verticalTrackRef.current.style.left = `${shapeSizeRef.current.width + scrollLeftRef.current - verticalTrackRef.current.clientWidth}px`;
            }

            if (verticalThumbRef.current instanceof HTMLElement) {
                const verticalThumbTop =
                    scrollTopRef.current +
                    (scrollTopRef.current / scrollHeightRef.current) * shapeSizeRef.current.height;
                verticalThumbRef.current.style.top = `${verticalThumbTop}px`;
            }

            if (horizontalThumbRef.current instanceof HTMLElement) {
                const horizontalThumbLeft =
                    scrollLeftRef.current +
                    (scrollLeftRef.current / scrollWidthRef.current) * shapeSizeRef.current.width;
                horizontalThumbRef.current.style.left = `${horizontalThumbLeft}px`;
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
            let direction: 'horizontal' | 'vertical' | null | false = false;

            const mouseMoveHandler = (event: MouseEvent) => {
                if (direction === false) return;

                const containerRect = innerRef.current.getBoundingClientRect();
                const distanceFromTop = event.clientY - containerRect.top;
                const distanceFromBottom = containerRect.bottom - event.clientY;
                const distanceFromLeft = event.clientX - containerRect.left;
                const distanceFromRight = containerRect.right - event.clientX;

                if (distanceFromBottom < draggingScrollThreshold || distanceFromTop < draggingScrollThreshold) {
                    direction = 'vertical';
                    if (distanceFromBottom < draggingScrollThreshold) {
                        scrollSpeed = Math.min(
                            ((draggingScrollThreshold - distanceFromBottom) / draggingScrollThreshold) *
                                draggingScrollMaximumSpeed,
                            draggingScrollMaximumSpeed,
                        );
                    } else if (distanceFromTop < draggingScrollThreshold) {
                        scrollSpeed =
                            0 -
                            Math.min(
                                ((draggingScrollThreshold - distanceFromTop) / draggingScrollThreshold) *
                                    draggingScrollMaximumSpeed,
                                draggingScrollMaximumSpeed,
                            );
                    } else {
                        scrollSpeed = 0;
                    }
                } else if (distanceFromLeft < draggingScrollThreshold || distanceFromRight < draggingScrollThreshold) {
                    direction = 'horizontal';
                    if (distanceFromRight < draggingScrollThreshold) {
                        scrollSpeed = Math.min(
                            ((draggingScrollThreshold - distanceFromRight) / draggingScrollThreshold) *
                                draggingScrollMaximumSpeed,
                            draggingScrollMaximumSpeed,
                        );
                    } else if (distanceFromLeft < draggingScrollThreshold) {
                        scrollSpeed =
                            0 -
                            Math.min(
                                ((draggingScrollThreshold - distanceFromLeft) / draggingScrollThreshold) *
                                    draggingScrollMaximumSpeed,
                                draggingScrollMaximumSpeed,
                            );
                    } else {
                        scrollSpeed = 0;
                    }
                }

                const scrollAnimation = () => {
                    if (
                        innerRef.current instanceof HTMLElement &&
                        (['vertical', 'horizontal'] as Array<typeof direction>).includes(direction)
                    ) {
                        switch (direction) {
                            case 'vertical': {
                                const newScrollTop = scrollTopRef.current + scrollSpeed;

                                if (
                                    newScrollTop >= 0 &&
                                    newScrollTop <= scrollHeightRef.current - shapeSizeRef.current?.height
                                ) {
                                    scrollTopRef.current = newScrollTop;
                                    update();
                                }

                                break;
                            }
                            case 'horizontal': {
                                const newScrollLeft = scrollLeftRef.current + scrollSpeed;

                                if (
                                    newScrollLeft >= 0 &&
                                    newScrollLeft <= scrollWidthRef.current - shapeSizeRef.current?.width
                                ) {
                                    scrollLeftRef.current = newScrollLeft;
                                    update();
                                }

                                break;
                            }
                            default:
                                break;
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
                direction = null;
            };

            const mouseUpHandler = () => {
                direction = false;
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
                        legendShapeSize = shapeSizeRef.current?.height;
                        scrollDistance = scrollTopRef.current;
                        break;
                    case 'horizontal':
                        currentDistance = event.clientX;
                        scrollSize = scrollWidthRef.current;
                        legendShapeSize = shapeSizeRef.current?.width;
                        scrollDistance = scrollLeftRef.current;
                        break;
                }

                let newScrollDistance =
                    scrollDistance +
                    (currentDistance - lastPositionRef.current.distance) * (scrollSize / legendShapeSize);

                if (newScrollDistance < 0) {
                    newScrollDistance = 0;
                } else if (newScrollDistance > scrollHeightRef.current - shapeSizeRef.current?.height) {
                    newScrollDistance = scrollHeightRef.current - shapeSizeRef.current?.height;
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
            document.addEventListener('mouseup', mouseUpHandler, true);
            document.addEventListener('mousemove', mouseMoveHandler, true);

            return () => {
                verticalThumbRef.current.removeEventListener('mousedown', mouseDownHandler, true);
                document.removeEventListener('mouseup', mouseUpHandler, true);
                document.removeEventListener('mousemove', mouseMoveHandler, true);
            };
        }, [
            verticalThumbRef.current,
            scrollHeightRef.current,
            scrollLeftRef.current,
            scrollTopRef.current,
            shapeSizeRef.current,
            lastPositionRef.current,
            shapeSizeRef.current,
            scrollHeightRef.current,
        ]);

        return (
            <div
                {...scrollerCoasterProps}
                ref={innerRef}
                className={clsx(
                    scrollerCoasterProps?.className,
                    css({
                        overflow: 'hidden',
                        position,
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
                {horizontalTrackProps !== false && (
                    <div
                        // Omit the `thumbProps` to prevent getting warnings from React
                        {...getTrackHtmlProps(horizontalTrackProps)}
                        ref={horizontalTrackRef}
                        className={clsx(css(getTrackStyles('horizontal')), horizontalTrackProps?.className)}
                    >
                        <div
                            {...horizontalTrackProps?.thumbProps}
                            ref={horizontalThumbRef}
                            className={clsx(
                                css(getThumbStyles('horizontal')),
                                horizontalTrackProps?.thumbProps?.className,
                            )}
                        />
                    </div>
                )}
                {verticalTrackProps !== false && (
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
                )}
            </div>
        );
    },
);
