import React, { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { css } from '@emotion/css';
import { useUpdate } from 'ahooks';
import { CSSInterpolation } from '@emotion/css/dist/declarations/src/create-instance';

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
        { children, position = 'relative', horizontalTrackProps, verticalTrackProps, ...scrollerCoasterProps },
        outerRef,
    ) => {
        const update = useUpdate();
        const innerRef = useRef<HTMLDivElement | null>(null);
        const scrollHeightRef = useRef<number>(0);
        const scrollWidthRef = useRef<number>(0);
        const boundingClientRectRef = useRef<DOMRect | null>(null);
        const scrollTopRef = useRef<number>(0);
        const scrollLeftRef = useRef<number>(0);
        const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
        const verticalTrackRef = useRef<HTMLDivElement | null>(null);

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
                    !(boundingClientRectRef.current?.height > 0) ||
                    !(boundingClientRectRef.current?.width > 0) ||
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
                              width:
                                  (boundingClientRectRef.current.width / scrollWidthRef.current) *
                                  boundingClientRectRef.current.width,
                          }
                        : {}),
                    ...(variant === 'vertical'
                        ? {
                              width: '100%',
                              left: 0,
                              right: 0,
                              height:
                                  (boundingClientRectRef.current.height / scrollHeightRef.current) *
                                  boundingClientRectRef.current.height,
                          }
                        : {}),
                };
            },
            [
                horizontalTrackProps,
                verticalTrackProps,
                boundingClientRectRef.current,
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
                boundingClientRectRef.current = innerRef.current.getBoundingClientRect();
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
                !(boundingClientRectRef.current?.height > 0) ||
                !(boundingClientRectRef.current?.width > 0)
            ) {
                return;
            }

            const wheelHandler = (event: WheelEvent) => {
                event.stopPropagation();
                event.preventDefault();

                const newScrollTop = innerRef.current.scrollTop + event.deltaY;
                const newScrollLeft = innerRef.current.scrollLeft + event.deltaX;

                if (newScrollTop <= scrollHeightRef.current - boundingClientRectRef.current.height) {
                    scrollTopRef.current = newScrollTop < 0 ? 0 : newScrollTop;
                }

                if (newScrollLeft <= scrollWidthRef.current - boundingClientRectRef.current.width) {
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
            boundingClientRectRef.current,
        ]);

        useEffect(() => {
            if (
                !(innerRef.current instanceof HTMLElement) ||
                !(boundingClientRectRef.current?.height > 0) ||
                !(boundingClientRectRef.current?.width > 0)
            ) {
                return;
            }

            if (horizontalTrackRef.current instanceof HTMLElement) {
                horizontalTrackRef.current.style.top = `${boundingClientRectRef.current.height + scrollTopRef.current - horizontalTrackRef.current.getBoundingClientRect().height}px`;
            }

            if (verticalTrackRef.current instanceof HTMLElement) {
                verticalTrackRef.current.style.left = `${boundingClientRectRef.current.width + scrollLeftRef.current - verticalTrackRef.current.getBoundingClientRect().width}px`;
            }

            innerRef.current.scrollTo({ top: scrollTopRef.current, left: scrollLeftRef.current, behavior: 'instant' });
        }, [
            scrollTopRef.current,
            scrollLeftRef.current,
            horizontalTrackRef.current,
            verticalTrackRef.current,
            innerRef.current,
            boundingClientRectRef.current,
        ]);

        return (
            <div
                {...scrollerCoasterProps}
                ref={innerRef}
                className={clsx(
                    css({
                        overflow: 'auto',
                    }),
                    scrollerCoasterProps?.className,
                    css({
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
                            className={clsx(css(getThumbStyles('vertical')), verticalTrackProps?.thumbProps?.className)}
                        />
                    </div>
                )}
            </div>
        );
    },
);
