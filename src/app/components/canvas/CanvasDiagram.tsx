import go, { Diagram, Shape } from "gojs";
import { GuidedDraggingTool } from "./GuidedDraggingTool";
import { v4 as UUID } from 'uuid';
import { createBurst, freeArray } from "./ExtensionShapeUtils";


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

    nodeStyle() {
        return [
          // The Node.location comes from the "loc" property of the node data,
          // converted by the Point.parse static method.
          // If the Node.location is changed, it updates the "loc" property of the node data,
          // converting back using the Point.stringify static method.
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          {
            // the Node.location is at the center of each node
            locationSpot: go.Spot.Center
          }
        ];
      }
    
    textStyle(color:string) {
        return {
            font: "bold 13pt Lato, Helvetica, Arial, sans-serif",
            stroke: color
        }
    }

    addCustomShapes() {
        go.Shape.defineFigureGenerator('Session', (shape, w, h) => {
            const burstPoints = createBurst(10);
            const geo = new go.Geometry();
            const fig = new go.PathFigure(burstPoints[0].x * w, burstPoints[0].y * h, true);
            geo.add(fig);
            
            for (let i = 1; i < burstPoints.length; i += 3) {
                fig.add(new go.PathSegment(go.PathSegment.Bezier, burstPoints[i + 2].x * w,
                burstPoints[i + 2].y * h, burstPoints[i].x * w,
                burstPoints[i].y * h, burstPoints[i + 1].x * w,
                burstPoints[i + 1].y * h));
            }
            const lst = fig.segments.last();
            if (lst !== null) lst.close();
            freeArray(burstPoints);
            geo.spot1 = new go.Spot(.222, .222);
            geo.spot2 = new go.Spot(.777, .777);
            return geo;
        });

        go.Shape.defineFigureGenerator('Character', (shape, w, h) => {
            const geo = new go.Geometry();
            const fig = new go.PathFigure(0, 0, false);
            geo.add(fig);
          
            const fig2 = new go.PathFigure(.335 * w, (1 - .555) * h, true);
            geo.add(fig2);
            // Shirt
            fig2.add(new go.PathSegment(go.PathSegment.Line, .335 * w, (1 - .405) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .405) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .555) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, w, .68 * h, (1 - .12) * w, .46 * h,
              (1 - .02) * w, .54 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, w, h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, 0, h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, 0, .68 * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, .335 * w, (1 - .555) * h, .02 * w, .54 * h,
              .12 * w, .46 * h));
            // Start of neck
            fig2.add(new go.PathSegment(go.PathSegment.Line, .365 * w, (1 - .595) * h));
            const radiushead = .5 - .285;
            const centerx = .5;
            const centery = radiushead;
            const alpha2 = Math.PI / 4;
            const KAPPA2 = ((4 * (1 - Math.cos(alpha2))) / (3 * Math.sin(alpha2)));
            const radiusw = radiushead;
            const radiush = radiushead;
            const offsetw = KAPPA2 * radiusw;
            const offseth = KAPPA2 * radiush;
            // Circle (head)
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, (centerx - radiusw) * w, centery * h, (centerx - ((offsetw + radiusw) / 2)) * w, (centery + ((radiush + offseth) / 2)) * h,
              (centerx - radiusw) * w, (centery + offseth) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, centerx * w, (centery - radiush) * h, (centerx - radiusw) * w, (centery - offseth) * h,
              (centerx - offsetw) * w, (centery - radiush) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, (centerx + radiusw) * w, centery * h, (centerx + offsetw) * w, (centery - radiush) * h,
              (centerx + radiusw) * w, (centery - offseth) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Bezier, (1 - .365) * w, (1 - .595) * h, (centerx + radiusw) * w, (centery + offseth) * h,
              (centerx + ((offsetw + radiusw) / 2)) * w, (centery + ((radiush + offseth) / 2)) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .365) * w, (1 - .595) * h));
            // Neckline
            fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .555) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, (1 - .335) * w, (1 - .405) * h));
            fig2.add(new go.PathSegment(go.PathSegment.Line, .335 * w, (1 - .405) * h));
            const fig3 = new go.PathFigure(.2 * w, h, false);
            geo.add(fig3);
            // Arm lines
            fig3.add(new go.PathSegment(go.PathSegment.Line, .2 * w, .8 * h));
            const fig4 = new go.PathFigure(.8 * w, h, false);
            geo.add(fig4);
            fig4.add(new go.PathSegment(go.PathSegment.Line, .8 * w, .8 * h));
            return geo;
          });

          go.Shape.defineFigureGenerator("Monster", function(shape, w, h) {
            var geo = new go.Geometry();
            var fig = new go.PathFigure(0, h/2, true);
            geo.add(fig);
          
            // Containing circle
            fig.add(new go.PathSegment(go.PathSegment.Arc, 180, 360, w/2, h/2, w/2, h/2))
          
            function drawTriangle(fig: go.PathFigure, offsetx: number, offsety: number) {
              fig.add(new go.PathSegment(go.PathSegment.Move, (.3 + offsetx) * w, (.8 + offsety) * h));
              fig.add(new go.PathSegment(go.PathSegment.Line, (.5 + offsetx) * w, (.5 + offsety) * h));
              fig.add(new go.PathSegment(go.PathSegment.Line, (.1 + offsetx) * w, (.5 + offsety) * h));
              fig.add(new go.PathSegment(go.PathSegment.Line, (.3 + offsetx) * w, (.8 + offsety) * h).close());
            }
          
            // Triangles
            drawTriangle(fig, 0, 0);
            drawTriangle(fig, 0.4, 0);
            drawTriangle(fig, 0.2, -0.3);
            return geo;
          });
    }

    updateNodeTemplate($:any, model:any) {
        const defaultNode = $(go.Node, "Auto", this.nodeStyle(),
        $(go.Shape, "RoundedRectangle",
            { name: 'SHAPE', fill: 'white', strokeWidth: 0,
            portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
            },
            new go.Binding('fill', 'color')),
            $(go.TextBlock, this.textStyle('black'),
                { margin: 8, editable: true, font: '900 .875rem Roboto, sans-serif', wrap: go.TextBlock.WrapFit },
                new go.Binding("text").makeTwoWay())
        )
        
        const session = $(go.Node, "Auto", this.nodeStyle(),
            $(go.Shape, "Session",
                { name: 'SHAPE', fill: 'white', strokeWidth: 2, height: 75,
                portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
                },
                new go.Binding('fill', 'color')),
                $(go.TextBlock, this.textStyle('black'),
                    { margin: 8, editable: true, font: '900 .875rem Roboto, sans-serif', wrap: go.TextBlock.WrapFit },
                    new go.Binding("text").makeTwoWay())
                )
  

        const character = $(go.Node, "Auto", this.nodeStyle(),
            // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
            $(go.Shape, "Character",
                { name: 'SHAPE', fill: 'white', strokeWidth: 2, height: 75,
                portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
                },
                new go.Binding('fill', 'color')),
            $(go.TextBlock, this.textStyle('white'),
                { verticalAlignment: go.Spot.Bottom, width: 170, height: 60, margin: 8, editable: true, font: '900 .875rem Roboto, sans-serif', wrap: go.TextBlock.WrapFit },
                new go.Binding("text").makeTwoWay())
            )

        const monster = $(go.Node, "Auto", this.nodeStyle(),
            $(go.Shape, "Monster",
                { name: 'SHAPE', fill: 'white', strokeWidth: 2, height: 75,
                portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer'
                },
                new go.Binding('fill', 'color')),
                $(go.TextBlock, this.textStyle('yellow'),
                    { margin: 8, editable: true, font: '900 .875rem Roboto, sans-serif', wrap: go.TextBlock.WrapFit },
                    new go.Binding("text").makeTwoWay())
                )
  
    
        const templmap = new go.Map(); // In TypeScript you could write: new go.Map<string, go.Node>();
        // for each of the node categories, specify which template to use
        templmap.add("", defaultNode);
        templmap.add("session", session);
        templmap.add("character", character);
        templmap.add("monster", monster);
        

        model.nodeTemplateMap = templmap;
    }

    isLinkValid = (fromnode: any, fromport: any, tonode: { Tf: string; }, toport: any) => {
        console.log({fromnode, fromport, tonode, toport})
        if(tonode.Tf === 'session'){
            return true;
        }
        return false;
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
            'clickCreatingTool.archetypeNodeData': { text: 'New Session', color: '#fff' },
            draggingTool: new GuidedDraggingTool(),  // defined in GuidedDraggingTool.ts
            'draggingTool.horizontalGuidelineColor': 'blue',
            'draggingTool.verticalGuidelineColor': 'blue',
            'draggingTool.centerGuidelineColor': 'black',
            'draggingTool.guidelineWidth': 1,
            'animationManager.isEnabled': false,
            "linkingTool.linkValidation": this.isLinkValid,
            "relinkingTool.linkValidation": this.isLinkValid,
            layout: $(go.ForceDirectedLayout),
            model: $(go.GraphLinksModel,
                {
                linkKeyProperty: 'key',  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
                // UUID keys for nodes
                makeUniqueKeyFunction: (m: go.Model, data: any) => {
                    return UUID()
                },
                // UUID keys for links
                makeUniqueLinkKeyFunction: (m: go.GraphLinksModel, data: any) => {
                    return UUID()
                }
                })
            });
        
        this.addCustomShapes();
        this.updateNodeTemplate($, diagram);

        // relinking depends on modelData
        diagram.linkTemplate =
        $(go.Link,
            new go.Binding('relinkableFrom', 'canRelink').ofModel(),
            new go.Binding('relinkableTo', 'canRelink').ofModel(),
            $(go.Shape),
            $(go.Shape, { toArrow: 'Standard'}),
        );

        return diagram;
    };


    initPalette= (): go.Diagram => {
        const $ = go.GraphObject.make;
        const palette = $(go.Palette, 
            {
                'animationManager.isEnabled': false,
            }
        );

        this.addCustomShapes();
        this.updateNodeTemplate($, palette);
    
        return palette;
      }


};

const diagramInstance = new CanvasDiagram;

export default diagramInstance; 