'use client'
import * as go from 'gojs';
import { ReactDiagram, ReactPalette } from 'gojs-react';
import {useCallback, useEffect} from 'react';
import { v4 as UUID } from 'uuid';

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


  const nodeDataArray = [
    { text: "Session" ,  color: "white", key: UUID(), category:'session'},
    { text: "Character" ,  color: "Green", key: UUID(), category: 'character' }
  ]

  return (
    <div className='w-full h-full flex flex-row'>
      <ReactPalette
        divClassName='palette-component'
        initPalette={diagramInstance.initPalette}
        nodeDataArray={nodeDataArray}
      />
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
    </div>
  );
};