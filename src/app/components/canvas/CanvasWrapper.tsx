'use client'
import * as go from 'gojs';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useImmer } from 'use-immer';
import { v4 as UUID } from 'uuid';
import { Button } from 'flowbite-react';
import { MdAddCircle } from "react-icons/md";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Canvas from './Canvas';
import { useAppDispatch, useAppSelector } from '@/state/hook';
import { selectDiagramDataConfig, selectSelected, updateDiagramConfig } from '@/state/canvas.slice';
import ConfigPanel from '../configs/ConfigPanel';
import diagramInstance from './CanvasDiagram';


/**
 * Use a linkDataArray since we'll be using a GraphLinksModel,
 * and modelData for demonstration purposes. Note, though, that
 * both are optional props in ReactDiagram.
 */
export type DiagramData = {
  nodeDataArray: Array<go.ObjectData>;
  linkDataArray: Array<go.ObjectData>;
  modelData: go.ObjectData;
  selectedData: go.ObjectData | null;
  skipsDiagramUpdate: boolean;
}

export default function CanvasWrapper() {
  const dispatch = useAppDispatch();
  const diagram = diagramInstance.getDiagramRef();

  // Maps to store key -> arr index for quick lookups
  const [mapNodeKeyIdx, setMapNodeKeyIdx] = useState<Map<go.Key, number>>(new Map<go.Key, number>());
  const [mapLinkKeyIdx, setMapLinkKeyIdx] = useState<Map<go.Key, number>>(new Map<go.Key, number>());

  const diagramDataConfig = useAppSelector(selectDiagramDataConfig);
  const selectedData = useAppSelector(selectSelected);
  const isSelected = selectedData !== null && !!selectedData.text;
  console.log({selectedData, isSelected})

  const [diagramData, updateDiagramData] = useImmer<DiagramData>(() => diagramDataConfig);
  
  /**
   * Update map of node keys to their index in the array.
   */
  const refreshNodeIndex = useCallback((nodeArr: Array<go.ObjectData>) => {
    const newMapNodeKeyIdx: Map<go.Key, number> = new Map<go.Key, number>();
    nodeArr.forEach((n: go.ObjectData, idx: number) => {
      newMapNodeKeyIdx.set(n.key, idx);
    });
    setMapNodeKeyIdx(newMapNodeKeyIdx);
  }, []);

  /**
   * Update map of link keys to their index in the array.
   */
  const refreshLinkIndex = useCallback((linkArr: Array<go.ObjectData>) => {
    const newMapLinkKeyIdx: Map<go.Key, number> = new Map<go.Key, number>();
    linkArr.forEach((l: go.ObjectData, idx: number) => {
      newMapLinkKeyIdx.set(l.key, idx);
    });
    setMapLinkKeyIdx(newMapLinkKeyIdx);
  }, []);

  /**
   * Handle any relevant DiagramEvents, in this case just selection changes.
   * On ChangedSelection, find the corresponding data and set the selectedData state.
   * @param e a GoJS DiagramEvent
   */
  const handleDiagramEvent = (e: go.DiagramEvent) => {
    const name = e.name;
    switch (name) {
      case 'ChangedSelection': {
        const sel = e.subject.first();
        updateDiagramData((draft: DiagramData) => {
            if (sel) {
              if (sel instanceof go.Node) {
                const idx = mapNodeKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const nd = draft.nodeDataArray[idx];
                  draft.selectedData = nd;
                }
              } else if (sel instanceof go.Link) {
                const idx = mapLinkKeyIdx.get(sel.key);
                if (idx !== undefined && idx >= 0) {
                  const ld = draft.linkDataArray[idx];
                  draft.selectedData = ld;
                }
              }
            } else {
              draft.selectedData = null;
            }
      });
      break;
      }
      default: break;
    }
  };

  /**
   * Handle GoJS model changes, which output an object of data changes via Model.toIncrementalData.
   * This method iterates over those changes and updates state to keep in sync with the GoJS model.
   * @param obj a JSON-formatted string
   */
  const handleModelChange = (obj: go.IncrementalData) => {
    const insertedNodeKeys = obj.insertedNodeKeys;
    const modifiedNodeData = obj.modifiedNodeData;
    const removedNodeKeys = obj.removedNodeKeys;
    const insertedLinkKeys = obj.insertedLinkKeys;
    const modifiedLinkData = obj.modifiedLinkData;
    const removedLinkKeys = obj.removedLinkKeys;
    const modifiedModelData = obj.modelData;

    // maintain maps of modified data so insertions don't need slow lookups
    const modifiedNodeMap = new Map<go.Key, go.ObjectData>();
    const modifiedLinkMap = new Map<go.Key, go.ObjectData>();
    updateDiagramData((draft: DiagramData) => {
      let narr = draft.nodeDataArray;
      if (modifiedNodeData) {
        modifiedNodeData.forEach((nd: go.ObjectData) => {
          modifiedNodeMap.set(nd.key, nd);
          const idx = mapNodeKeyIdx.get(nd.key);
          if (idx !== undefined && idx >= 0) {
            narr[idx] = nd;
            if (draft.selectedData && draft.selectedData.key === nd.key) {
              draft.selectedData = nd;
            }
          }
        });
      }
      if (insertedNodeKeys) {
        insertedNodeKeys.forEach((key: go.Key) => {
          const nd = modifiedNodeMap.get(key);
          const idx = mapNodeKeyIdx.get(key);
          if (nd && idx === undefined) {  // nodes won't be added if they already exist
            mapNodeKeyIdx.set(nd.key, narr.length);
            narr.push(nd);
          }
        });
      }
      if (removedNodeKeys) {
        narr = narr.filter((nd: go.ObjectData) => {
          if (removedNodeKeys.includes(nd.key)) {
            return false;
          }
          return true;
        });
        draft.nodeDataArray = narr;
        refreshNodeIndex(narr);
      }

      let larr = draft.linkDataArray;
      if (modifiedLinkData) {
        modifiedLinkData.forEach((ld: go.ObjectData) => {
          modifiedLinkMap.set(ld.key, ld);
          const idx = mapLinkKeyIdx.get(ld.key);
          if (idx !== undefined && idx >= 0) {
            larr[idx] = ld;
            if (draft.selectedData && draft.selectedData.key === ld.key) {
              draft.selectedData = ld;
            }
          }
        });
      }
      if (insertedLinkKeys) {
        insertedLinkKeys.forEach((key: go.Key) => {
          const ld = modifiedLinkMap.get(key);
          const idx = mapLinkKeyIdx.get(key);
          if (ld && idx === undefined) {  // links won't be added if they already exist
            mapLinkKeyIdx.set(ld.key, larr.length);
            larr.push(ld);
          }
        });
      }
      if (removedLinkKeys) {
        larr = larr.filter((ld: go.ObjectData) => {
          if (removedLinkKeys.includes(ld.key)) {
            return false;
          }
          return true;
        });
        draft.linkDataArray = larr;
        refreshLinkIndex(larr);
      }
      // handle model data changes, for now just replacing with the supplied object
      if (modifiedModelData) {
        draft.modelData = modifiedModelData;
      }
      draft.skipsDiagramUpdate = true;  // the GoJS model already knows about these updates
    });
  };

  /**
   * Handle changes to the checkbox on whether to allow relinking.
   * @param e a change event from the checkbox
   */
  const handleRelinkChange = (e: any) => {
    const target = e.target;
    const value = target.checked;
    updateDiagramData((draft: any) => {
      draft.modelData.canRelink = value;
      draft.skipsDiagramUpdate = false;
    });
  };

  useEffect(() => {
    refreshNodeIndex(diagramData.nodeDataArray);
    refreshLinkIndex(diagramData.linkDataArray);
  }, [refreshNodeIndex, refreshLinkIndex, diagramData.nodeDataArray, diagramData.linkDataArray]);

  // Handle selections
  useEffect(() => {
    /**
     * Handle inspector changes, and on input field blurs, update node/link data state.
     * @param path the path to the property being modified
     * @param value the new value of that property
     * @param isBlur whether the input event was a blur, indicating the edit is complete
     */
    const handleInputChange = (path: string, value: string, isBlur: boolean) => {
      updateDiagramData((draft: DiagramData) => {
        const data = draft.selectedData as go.ObjectData;  // only reached if selectedData isn't null
        data[path] = value;
        if (isBlur) {
          const key = data.key;
          if (key < 0) {  // negative keys are links
            const idx = mapLinkKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.linkDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          } else {
            const idx = mapNodeKeyIdx.get(key);
            if (idx !== undefined && idx >= 0) {
              draft.nodeDataArray[idx] = data;
              draft.skipsDiagramUpdate = false;
            }
          }
        }
      });
    };

  }, [diagramData.selectedData, mapLinkKeyIdx, mapNodeKeyIdx, updateDiagramData]);


  // handle addNode to array
  const addNode = () => {

    if(diagram !== null){
      const key = UUID();
      const newnode = { key, text: 'New Session', color: '#fff', loc: '10 10' };
      diagram?.model.commit(m => {  // m == the Model
        diagram.model.addNodeData(newnode);
        // const newlink = { from: selnode.data.key, to: newnode.NodeId }
        // diagram.model.addLinkData(newlink)
      }, "add node");
    }
  }


  useEffect(() => {
    dispatch(updateDiagramConfig(diagramData))
  }, [diagramData])

  // panel control
  const ref = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const panel = ref.current;
    if(!isSelected){
      if (panel) {
        panel.collapse();
      }
    } else {
      if (panel) {
        panel.expand();
      }
    }
  }, [isSelected])

  return (
    <div className="w-full h-[calc(100vh-42px)] flex flex-row">
        {/* <div className="h-full  w-12 flex flex-col">
          <Button onClick={() => addNode()} >
              <MdAddCircle className="h-6 w-6"/>
          </Button>
        </div> */}
       <PanelGroup direction="horizontal">
        <Panel order={1} id="diagram-canvas">
          <Canvas
            diagramData={diagramData}
            onDiagramEvent={handleDiagramEvent}
            onModelChange={handleModelChange}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel order={2} defaultSize={ 30 } collapsible collapsedSize={1}  ref={ref} >
            { isSelected ?
              <ConfigPanel /> :
              null
            }
        </Panel>
      </PanelGroup>
    </div>
  );
};