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
        const innerRef = useRef<HTMLDivElement>(null);
        const scrollHeightRef = useRef<number>(0);
        const scrollWidthRef = useRef<number>(0);
        const boundingClientRectRef = useRef<DOMRect | null>(null);

        const getTrackHtmlProps = useCallback((props: ScrollerCoasterTrackProps) => {
            return _.omit(props, ['thumbProps', 'size']);
        }, []);

        const getTrackStyles = useCallback<(variant: 'horizontal' | 'vertical') => CSSInterpolation>(
            (variant) => {
                if (horizontalTrackProps === false || verticalTrackProps === false) {
                    return {};
                }
                return {
                    position: 'absolute',
                    ...(variant === 'horizontal'
                        ? { left: 0, right: 0, bottom: 0, width: '100%', height: horizontalTrackProps?.size ?? 12 }
                        : {}),
                    ...(variant === 'vertical'
                        ? { top: 0, bottom: 0, right: 0, height: '100%', width: verticalTrackProps?.size ?? 12 }
                        : {}),
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                };
            },
            [horizontalTrackProps, verticalTrackProps],
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
                        className={clsx(css(getTrackStyles('horizontal')), horizontalTrackProps?.className)}
                    >
                        <div
                            {...horizontalTrackProps?.thumbProps}
                            className={clsx(css(getThumbStyles('horizontal')), horizontalTrackProps?.className)}
                        />
                    </div>
                )}
                {verticalTrackProps !== false && (
                    <div
                        {...getTrackHtmlProps(verticalTrackProps)}
                        className={clsx(css(getTrackStyles('vertical')), verticalTrackProps?.className)}
                    >
                        <div
                            {...verticalTrackProps?.thumbProps}
                            className={clsx(css(getThumbStyles('vertical')), verticalTrackProps?.className)}
                        />
                    </div>
                )}
            </div>
        );
    },
);
