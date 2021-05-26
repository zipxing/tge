import * as log from "./log"

export function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

//采用Microsoft的LCG,c代码和javascript代码生成随机序列可以方便的对上
var randomNext:number=0;

export function srand(seed:number) {
    randomNext = seed>>>0;
}

export function rand() {
    randomNext = (randomNext*214013 + 2531011)&0x7FFFFFFF;
    return ((randomNext>>16)&0x7FFF);
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function pointInRect(rect:Rect, point:Point) {
    return (point.x >= rect.x && point.x <= rect.x + rect.width &&
        point.y >= rect.y && point.y <= rect.y + rect.height);
}

export function glCheck(gl: any) {
    let glAbility: any = {};
    glAbility.MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    glAbility.MAX_VIEWPORT_DIMS = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    glAbility.MAX_CUBE_MAP_TEXTURE_SIZE = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    glAbility.MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    //Shaders
    glAbility.MAX_VERTEX_ATTRIBS = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    glAbility.MAX_VERTEX_UNIFORM_VECTORS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    glAbility.MAX_VARYING_VECTORS = gl.getParameter(gl.MAX_VARYING_VECTORS);
    glAbility.MAX_COMBINED_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_VERTEX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_TEXTURE_IMAGE_UNITS = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    glAbility.MAX_FRAGMENT_UNIFORM_VECTORS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    //WebGL 2
    if(glAbility.WebGL2){
        glAbility.MAX_3D_TEXTURE_SIZE = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE);
        glAbility.MAX_ELEMENTS_VERTICES = gl.getParameter(gl.MAX_ELEMENTS_VERTICES);
        glAbility.MAX_ELEMENTS_INDICES = gl.getParameter(gl.MAX_ELEMENTS_INDICES);
        glAbility.MAX_TEXTURE_LOD_BIAS = gl.getParameter(gl.MAX_TEXTURE_LOD_BIAS);
        glAbility.MAX_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_COMPONENTS);
        glAbility.MAX_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_COMPONENTS);
        glAbility.MAX_ARRAY_TEXTURE_LAYERS = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
        glAbility.MIN_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MIN_PROGRAM_TEXEL_OFFSET);
        glAbility.MAX_PROGRAM_TEXEL_OFFSET = gl.getParameter(gl.MAX_PROGRAM_TEXEL_OFFSET);
        glAbility.MAX_VARYING_COMPONENTS = gl.getParameter(gl.MAX_VARYING_COMPONENTS);
        glAbility.MAX_VERTEX_OUTPUT_COMPONENTS = gl.getParameter(gl.MAX_VERTEX_OUTPUT_COMPONENTS);
        glAbility.MAX_FRAGMENT_INPUT_COMPONENTS = gl.getParameter(gl.MAX_FRAGMENT_INPUT_COMPONENTS);
        glAbility.MAX_SERVER_WAIT_TIMEOUT = gl.getParameter(gl.MAX_SERVER_WAIT_TIMEOUT);
        glAbility.MAX_ELEMENT_INDEX = gl.getParameter(gl.MAX_ELEMENT_INDEX);

        //draw buffers
        glAbility.MAX_DRAW_BUFFERS = gl.getParameter(gl.MAX_DRAW_BUFFERS);
        glAbility.MAX_COLOR_ATTACHMENTS = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);

        //Samplers
        glAbility.MAX_SAMPLES = gl.getParameter(gl.MAX_SAMPLES);

        //Transform feedback
        glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS);
        glAbility.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS);
        glAbility.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS = gl.getParameter(gl.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);

        //Uniforms
        glAbility.MAX_VERTEX_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_VERTEX_UNIFORM_BLOCKS);
        glAbility.MAX_FRAGMENT_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_BLOCKS);
        glAbility.MAX_COMBINED_UNIFORM_BLOCKS = gl.getParameter(gl.MAX_COMBINED_UNIFORM_BLOCKS);
        glAbility.MAX_UNIFORM_BUFFER_BINDINGS = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
        glAbility.MAX_UNIFORM_BLOCK_SIZE = gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE);
        glAbility.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS);
        glAbility.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS = gl.getParameter(gl.MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS);
    }

    for(let key in glAbility){
        log.info('===>',key, glAbility[key]);
    }
    return glAbility;
}

