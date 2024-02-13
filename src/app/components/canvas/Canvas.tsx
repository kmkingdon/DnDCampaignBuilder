'use client'
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import {useState, useCallback, useEffect} from 'react';

import diagramInstance from './CanvasDiagram';

type DiagramData = {
    nodeDataArray: Array<go.ObjectData>;
    linkDataArray: Array<go.ObjectData>;
    modelData: go.ObjectData;
    selectedData: go.ObjectData | null;
    skipsDiagramUpdate: boolean;
}

interface CanvasProps {
  diagramData: DiagramData;
  onDiagramEvent: (e: go.DiagramEvent) => void;
  onModelChange: (e: go.IncrementalData) => void;
}

export default function Canvas(props: CanvasProps) {
  const { diagramData, onDiagramEvent, onModelChange } = props;

  const diagram = diagramInstance.getDiagramRef();

  const diagramRef = useCallback((ref: ReactDiagram | null) => {
    if (ref != null) {
      diagramInstance.setDiagramRef(ref.getDiagram());
      if (diagram instanceof go.Diagram) {
        diagram.addDiagramListener('ChangedSelection', onDiagramEvent);
      }
    }
  }, [diagram, onDiagramEvent]);


  // Cleanup
  useEffect(() => {
    return () => {
      if (diagram instanceof go.Diagram) {
        diagram.removeDiagramListener('ChangedSelection', onDiagramEvent);
      }
    };
  }, [diagram, onDiagramEvent]);

  
  return (
    <ReactDiagram
        ref={diagramRef}
        divClassName='diagram-component'
        initDiagram={diagramInstance.initDiagram}
        nodeDataArray={diagramData.nodeDataArray}
        linkDataArray={diagramData.linkDataArray}
        modelData={diagramData.modelData}
        onModelChange={onModelChange}
        skipsDiagramUpdate={diagramData.skipsDiagramUpdate}
    />
  );
};