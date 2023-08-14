# Migrating to the new HLF

## Introduction

HLF is changing! We are moving towards

- a new name for the framework (under discussion)
- hosting on GitHub
- open sourcing the framework
- a new website / docs site / code examples
- a new release / contribution process
- new features and improvements

## New name

Still TBD

## Hosting on GitHub

We are moving to GitHub for hosting the framework. This will allow us to open source the framework and allow for easier
contribution.

## Open sourcing the framework

We are discussing an open source license and looking to move to open source so we might be able to accept contributions
from the community and easier onboarding to the framework.

## New website / docs site / code examples

We are moving to a new website and docs site.

- For now, the docs site remains auto-generated by TsDoc.
- We'd like to add examples and a guide on a proper website for the framework. The current plan is to
  use [Starlight](https://starlight.astro.build/) for this, so it will be easy to include inline code samples.
- We are also working on doing functional examples using [CodeSandbox](https://codesandbox.io/). Stay tuned.

## New release / contribution process

- We are now using release please to manage releases. This will allow us to automate the release process (and
  the [Changelog](./CHANGELOG.md). and make it easier.
- Commits should follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/). This will
  allow us to automate the release process and
  generate the changelog.

## New features and improvements

### New features

#### App structure

- Really, this can be left up to personal preference, but ideally we move to a structure like this:

```
project root
  src
    index.html
    index.css
    index.ts
    Application.ts
    components
      ui
        Button.ts
        lider.ts
      game
        Player.ts
        Enemy.ts
    state
      SplashScreen.ts
      MainMenu.ts
      Game.ts
      ..etc
    utils
      util1.ts
      util2.ts
    assets
      fonts
        font.woff2
      images
        spritesheets
          ui
            image.jpg
          game
            image.jpg
          ui.tps
          game.tps
        static
          image.jpg
        audio
            output
              sound.mp3
            source
              sfx
                sfx.mp3
              vo
                ui
                  ui.mp3
                game
                  game.mp3
```

#### Vite bundler in projects

- We're switching to vite to bundle projects. This allows for faster builds and is a bit more modern.
- WebPack could still be used if desired.

#### Physics library support

##### Physics is being designed as opt-in only, so you can choose to use it or not.

- Added physics library support for [Matter JS](https://brm.io/matter-js/).
- Added physics library support for [Rapier](https://rapier.rs/).

Work on physics library support is still ongoing, but some examples can be found in the [examples](./examples) folder.

#### [PIXI Layout](https://pixijs.io/layout/) support

This is already added to `State.ts` as an experimental feature, but we'll expand on this moving forward.

This will:

- remove the need to manually position UI elements in many cases
- remove the need to reposition UI elements when the screen size changes

#### [PIXI UI](https://pixijs.io/ui) support

The goal is to redesign core UI elements to use PIXI UI, which will:

- keep us closer to the PIXI ecosystem
- make building UI elements such as menus, lists, grids and forms much easier

### API Improvements

##### The API is being redesigned to be more intuitive and easier to use.

- Where possible, we are trying to avoid breaking changes to the API unless absolutely necessary.
- Mostly, we're trying to move away from the need to know about third party libraries being used under the hood, and
  adding a "convenience layer" to bridge the gap between the framework and third party libraries.

--- 

#### Example: App creation

__Before:__

```typescript
import {Application} from "./scripts/Application";

const canvasDiv = document.createElement("div");
canvasDiv.setAttribute("id", "game-target");
document.body.appendChild(canvasDiv);

canvasDiv.appendChild(Application.instance.view);
Application.instance.init();
```

__After:__

```typescript
import Application from "@/Application";

Application.create();
```

--- 

#### Example: Registering a game state

__Before:__

```typescript
this._stateManager.registerState(Constants.STATE_LANDING_PAGE, () => new LandingPage());
```

__After:__

```typescript
this.state.register(LandingPage);
```

--- 

#### Example: Transitioning to a new game state

__Before:__

```typescript
PubSub.publishSync(HLF.STATE_LOAD_STATE, new HLF.StateToken(
	Constants.STATE_LANDING_PAGE, undefined, ...HLF.StateToken.TRANSITION_ANIM_OLD_OUT_REVEAL,
));
```

__After:__

```typescript
// in Applicatgion.ts
protected
setup()
{
	this.registerDefaultLoadScreen(Interstitial);
	this.state.defaultTransitionType = TransitionType.TRANSITION_ANIM_OLD_OUT_REVEAL;
}
//...later, from any state
this.app.state.transitionTo(LandingPage.NAME);
```

---

###### Example: PubSub JS

__Before:__

```typescript
import {PubSub} from "pubsub-js";

PubSub.subscribe("SOME_EVENT_NAME", (message, data) => {
	this.doSomething();
});

PubSub.publishSync("SOME_EVENT_NAME", someData);
```

__After:__

```typescript
this.app.subscribe("SOME_EVENT_NAME", this.doSomething);
this.app.broadcast("SOME_EVENT_NAME", someData);
```

---

###### Example: Adding a new PIXI entity to a game state

Factory methods serve to help with common tasks, such as adding a new PIXI entity to a game state. One method with
parameters to set the initial state of the entity is used instead of multiple lines of code.

- Each state comes equipped with "add" and "make" methods to access factory methods.

__Before:__

```typescript
this.bg = this.addChild(new PIXI.Sprite(someTexture));
this.bg.anchor.set(0.5, 0.5);
this.bg.position.set(0, 0);
```

__After:__
`this.add.sprite(texture, sheet, alpha,anchor, position, ...)`

```typescript
this.bg = this.add.sprite('someTexture', undefined, 1, [0.5, 0.5], [100, 100]);
```