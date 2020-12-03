namespace tge3d {

    export enum SystemComponents {
        Renderer = 'renderer',
        Mesh = 'mesh',
        Camera = 'camera',
        Light = 'light',
        Projector = 'projector'
    }

    export class Component {
        node: Node | null;

        constructor() {
            this.node = null;
        }

        setNode(node: Node) {
            this.node = node;
        }
    }
}
