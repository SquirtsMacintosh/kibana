/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { rgba } from 'polished';
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { pure } from 'recompose';
import styled from 'styled-components';

interface Props {
  children?: React.ReactNode;
  droppableId: string;
  height?: string;
  isDropDisabled?: boolean;
  type?: string;
  render?: ({ isDraggingOver }: { isDraggingOver: boolean }) => React.ReactNode;
}

const ReactDndDropTarget = styled.div<{ isDraggingOver: boolean; height: string }>`
  transition: background-color 0.7s ease;
  width: 100%;
  height: ${({ height }) => height};
  .flyout-overlay {
    .euiPanel {
      background-color: ${props => props.theme.eui.euiFormBackgroundColor};
    }
  }
  ${props =>
    props.isDraggingOver
      ? `
    .drop-and-provider-timeline {
      &:hover {
        background-color: ${rgba(props.theme.eui.euiColorSuccess, 0.3)};
      }
    }
    .drop-and-provider-timeline:hover {
        background-color: ${rgba(props.theme.eui.euiColorSuccess, 0.3)};
    }
  > div.timeline-drop-area-empty {
     color: ${props.theme.eui.euiColorSuccess}
     background-color: ${rgba(props.theme.eui.euiColorSuccess, 0.2)};

     & .euiTextColor--subdued {
      color: ${props.theme.eui.euiColorSuccess};
     }
  }
  > div.timeline-drop-area {
    background-color: ${rgba(props.theme.eui.euiColorSuccess, 0.2)};
    .provider-item-filter-container div:first-child{
      // Override dragNdrop beautiful so we do not have our droppable moving around for no good reason
      transform: none !important;
    }
    .drop-and-provider-timeline {
      display: block !important;
      + div {
        display: none;
      }
    }

    & .euiFormHelpText {
      color: ${props.theme.eui.euiColorSuccess};
    }
  }
  .flyout-overlay {
    .euiPanel {
      background-color: ${props.theme.eui.euiColorLightShade};
    }
    + div {
      // Override dragNdrop beautiful so we do not have our droppable moving around for no good reason
      display: none !important;
    }
  }
  `
      : ''}
  > div.timeline-drop-area {
    .drop-and-provider-timeline {
      display: none;
    }
    & + div {
      // Override dragNdrop beautiful so we do not have our droppable moving around for no good reason
      display: none !important;
    }
  }
`;
ReactDndDropTarget.displayName = 'ReactDndDropTarget';

export const DroppableWrapper = pure<Props>(
  ({
    children = null,
    droppableId,
    height = '100%',
    isDropDisabled = false,
    type,
    render = null,
  }) => (
    <Droppable
      isDropDisabled={isDropDisabled}
      droppableId={droppableId}
      direction={'horizontal'}
      type={type}
    >
      {(provided, snapshot) => (
        <ReactDndDropTarget
          height={height}
          innerRef={provided.innerRef}
          {...provided.droppableProps}
          isDraggingOver={snapshot.isDraggingOver}
        >
          {render == null ? children : render({ isDraggingOver: snapshot.isDraggingOver })}
          {provided.placeholder}
        </ReactDndDropTarget>
      )}
    </Droppable>
  )
);
DroppableWrapper.displayName = 'DroppableWrapper';
