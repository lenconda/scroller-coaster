import React from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import { css } from '@emotion/css';

export interface ScrollerCoasterTrackProps
    extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * @description Thumb props
     * @type React.HTMLAttributes<HTMLDivElement>
     */
    thumbProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface ScrollerCoasterProps
    extends React.HTMLAttributes<HTMLDivElement> {
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

export const ScrollerCoaster: React.FC<ScrollerCoasterProps> = ({
    children,
    position = 'relative',
    horizontalTrackProps,
    verticalTrackProps,
    ...scrollerCoasterProps
}) => {
    return (
        <div
            {...scrollerCoasterProps}
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
            {/* If passed value of `horizontalTrackProps` is `false`, then hide the whole horizontal tracker */}
            {horizontalTrackProps !== false && (
                <div
                    // Omit the `thumbProps` to prevent getting warnings from React
                    {..._.omit(horizontalTrackProps, ['thumbProps'])}
                    className={clsx(horizontalTrackProps?.className)}
                >
                    <div
                        {...horizontalTrackProps?.thumbProps}
                        className={clsx(horizontalTrackProps?.className)}
                    />
                </div>
            )}
            {verticalTrackProps !== false && (
                <div
                    {..._.omit(verticalTrackProps, ['thumbProps'])}
                    className={clsx(verticalTrackProps?.className)}
                >
                    <div
                        {...verticalTrackProps?.thumbProps}
                        className={clsx(verticalTrackProps?.className)}
                    />
                </div>
            )}
        </div>
    );
};
