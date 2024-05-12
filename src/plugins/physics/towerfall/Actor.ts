import { Rectangle } from 'pixi.js';
import { Application } from '../../../core/Application';
import { Entity } from './Entity';
import { System } from './System';
import { Collision, EntityType } from './types';
import { checkCollision } from './utils';

export class Actor<T = any, A extends Application = Application> extends Entity<T, A> {
  type = 'Actor';
  isActor = true;
  passThroughTypes: EntityType[] = [];
  passingThrough: Set<Entity> = new Set();

  get collideables(): Entity[] {
    return System.getNearbyEntities(this, (e) => e.isSolid);
  }

  added() {
    System.addActor(this);
  }

  removed() {
    System.removeActor(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  squish(_collision?: Collision, _pushingEntity?: Entity) {}

  moveX(
    amount: number,
    onCollide?: (collision: Collision, pushingEntity?: Entity) => void,
    onNoCollisions?: (() => void) | null,
    pushingEntity?: Entity,
  ): void {
    this.xRemainder += amount;
    let move = Math.round(this.xRemainder);
    const sign = Math.sign(move);

    while (move !== 0) {
      const nextX = this.x + (move ? sign : 0); // Predict the next X position
      const collisions: Collision[] | false = this.collideAt(nextX - this.x, 0, this.getBoundingBox());
      if (collisions) {
        if (onCollide) {
          collisions.forEach((collision) => onCollide(collision, pushingEntity));
        }
        this.xRemainder = 0; // Reset the remainder to prevent sliding
        break;
      } else {
        this.x = nextX;
        move -= sign;
        this.xRemainder -= sign;
        if (onNoCollisions) {
          onNoCollisions();
        }
      }
    }
    System.updateEntity(this);
  }

  moveY(
    amount: number,
    onCollide?: ((collision: Collision, pushingEntity?: Entity) => void) | null,
    onNoCollisions?: (() => void) | null,
    pushingEntity?: Entity,
  ): void {
    this.yRemainder += amount;
    let move = Math.round(this.yRemainder);
    const sign = Math.sign(move);
    while (move !== 0) {
      const nextY = this.y + (move ? sign : 0); // Predict the next Y position
      const collisions: Collision[] | false = this.collideAt(0, nextY - this.y, this.getBoundingBox());
      if (collisions) {
        if (onCollide) {
          collisions.forEach((collision) => onCollide(collision, pushingEntity));
        }
        this.yRemainder = 0;
        break;
      } else {
        this.y = nextY;
        move -= sign;
        this.yRemainder -= sign;
        if (onNoCollisions) {
          onNoCollisions();
        }
      }
    }
    System.updateEntity(this);
  }

  // Simple bounding box collision check
  collideAt(x: number, y: number, box: Rectangle): Collision[] | false {
    const nextPosition = new Rectangle(
      box.x + x * this.system.container.worldTransform.d,
      box.y + y * this.system.container.worldTransform.d,
      box.width,
      box.height,
    );
    const collisions = [];
    // Iterate through all solids in the level to check for collisions
    for (const entity of this.collideables) {
      if (!entity.isCollideable || this.passThroughTypes.includes(entity.type)) {
        continue;
      }
      const solidBounds = entity.getBoundingBox();
      const collisionResult = checkCollision(nextPosition, solidBounds, this, entity);
      if (collisionResult) {
        System.collide(collisionResult);
        // if the collision resolver returns true,
        // we should stop and return this collision
        // this will stop actor movement if returned
        if (System.resolveCollision(collisionResult)) {
          collisions.push(collisionResult);
        }
      }
    }
    return collisions.length ? collisions : false;
  }

  isRiding(solid: Entity): boolean {
    const actorBounds = this.getBoundingBox();
    const solidBounds = solid.getBoundingBox();

    // Basic check if actor is directly on top of the solid
    return (
      actorBounds.bottom >= solidBounds.top - 2 &&
      actorBounds.bottom <= solidBounds.top + solidBounds.height - 1 &&
      actorBounds.left < solidBounds.right &&
      actorBounds.right > solidBounds.left
    );
  }

  setPassingThrough(entity: Entity) {
    this.passingThrough.add(entity);
  }

  removePassingThrough(entity: Entity) {
    this.passingThrough.delete(entity);
  }

  isPassingThrough(entity: Entity) {
    return this.passingThrough.has(entity);
  }
}
