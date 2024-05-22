import { Color } from '../Utils';
import { Attachment, VertexAttachment } from './Attachment';

/** An attachment with vertices that make up a polygon. Can be used for hit detection, creating physics bodies, spawning particle
 * effects, and more.
 *
 * See {@link SkeletonBounds} and [Bounding Boxes](http://esotericsoftware.com/spine-bounding-boxes) in the Spine User
 * Guide. */
export declare class BoundingBoxAttachment extends VertexAttachment {
    color: Color;
    constructor(name: string);
    copy(): Attachment;
}
//# sourceMappingURL=BoundingBoxAttachment.d.ts.map