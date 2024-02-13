import go, { Diagram } from "gojs";
import { GuidedDraggingTool } from "./GuidedDraggingTool";
import { ReactDiagram } from "gojs-react";

class CanvasDiagram {
    diagram: null | go.Diagram;

    constructor(){
        this.diagram = null;
    }

    setDiagramRef(diagramRef: Diagram | null){
        this.diagram = diagramRef;
    }

    getDiagramRef(){
        return this.diagram;
    }

    /**
   * Diagram initialization method, which is passed to the ReactDiagram component.
   * This method is responsible for making the diagram and initializing the model, any templates,
   * and maybe doing other initialization tasks like customizing tools.
   * The model's data should not be set here, as the ReactDiagram component handles that.
   */
    initDiagram = (): go.Diagram => {
        const $ = go.GraphObject.make;
        // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
        const diagram =
        $(go.Diagram,
            {                                                                                                                                                 
            'undoManager.isEnabled': true,  // must be set to allow for model change listening
            // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
            'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
            draggingTool: new GuidedDraggingTool(),  // defined in GuidedDraggingTool.ts
            'draggingTool.horizontalGuidelineColor': 'blue',
            'draggingTool.verticalGuidelineColor': 'blue',
            'draggingTool.centerGuidelineColor': 'green',
            'draggingTool.guidelineWidth': 1,
            layout: $(go.ForceDirectedLayout),
            model: $(go.GraphLinksModel,
                {
                linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
                // positive keys for nodes
                makeUniqueKeyFunction: (m: go.Model, data: any) => {
                    let k = data.key || 1;
                    while (m.findNodeDataForKey(k)) k++;
                    data.key = k;
                    return k;
                },
                // negative keys for links
                makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                    let k = data.key || -1;
                    while (m.findLinkDataForKey(k)) k--;
                    data.key = k;
                    return k;
                }
                })
            });

        // define a simple Node template
        diagram.nodeTemplate =
        $(go.Node, 'Auto',  // the Shape will go around the TextBlock
            new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, 'RoundedRectangle',
            {
                name: 'SHAPE', fill: 'white', strokeWidth: 0,
                // set the port properties:
                portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
            },
            // Shape.fill is bound to Node.data.color
            new go.Binding('fill', 'color')),
            $(go.TextBlock,
            { margin: 8, editable: true, font: '400 .875rem Roboto, sans-serif' },  // some room around the text
            new go.Binding('text').makeTwoWay()
            )
        );

        // relinking depends on modelData
        diagram.linkTemplate =
        $(go.Link,
            new go.Binding('relinkableFrom', 'canRelink').ofModel(),
            new go.Binding('relinkableTo', 'canRelink').ofModel(),
            $(go.Shape),
            $(go.Shape, { toArrow: 'Standard' })
        );

        return diagram;
    };

};

const diagramInstance = new CanvasDiagram;

export default diagramInstance; 