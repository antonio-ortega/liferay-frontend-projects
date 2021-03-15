# React state management

State management is a complicated topic which we can't possibly hope to cover fully in a guidelines document like this, but this page provides three things to get you started:

1. General principles for how to manage state in React.
2. Guidelines on the use of Liferay's global state API, as provided by `@liferay/frontend-js-state-web`.
3. Links to further reading.

## General principles

When you first encounter React it may look like just a rendering library for updating the DOM using JS. As you get to know it better, you'll see it is more than that, and it has a number of novel ideas, including:

1. Components are the fundamental unit of abstraction and composition.
2. Data flows down from the top of the component tree towards the bottom.
3. Shared data should be immutable, and functions should be pure.

In sum, these principals act together to make software systems easier to reason about, safe to modify, and enable reuse. In order to get the most out of these patterns, we have to make sure that state management — one of the most complicated aspects of applications as they grow larger — follows some "best practices":

### Keep component state as close as possible to where it is needed

React provides [a `useState` hook](https://reactjs.org/docs/hooks-state.html) for reading and updating state. You can think of state as a "variable" that is associated with a component, and whenever that variable changes, the component will be updated (re-rendered). If you only need state in one component, store that state locally "inside" the component using `useState`. Storing state inside a component means that it is encapsulated, which makes it easier to reason about how that component will behave. (Contrast this with global state, where in order to understand the behavior of a component that accesses global state, you have to understand all the places in the entire system that may read from or write to that global state.)

### When state needs to be shared among a small subtree of components, hoist it up to the nearest common ancestor

As a simple example, consider two neighboring components that must share a piece of text: one of them shows an input field for changing the text, and the other shows a marked-up version of the text. If we follow the guideline to "keep component state as close as possible to where it is needed" in this scenario, that means moving the state up into the parent component. The parent component "owns" the state and contains the `useState` call. The child components receive the value via [props](https://reactjs.org/docs/components-and-props.html). Note that data always flows down, so in order to update the state in the parent, it must also pass down a callback that the child can use in order to request an update. That might look like this:

```jsx
function ParentComponent() {
	const [name, setName] = useState('');

	return (
		<>
			<ChildComponent
				onValueChange={(newName) => setName(name)}
				value={name}
			/>
			<OtherComponent value={name} />
		</>
	);
}
```

### Simplify the component hierarchy as much as possible

One of the main reasons we define things in terms of components is to make them intellectually manageable and to facilitate reuse. That _often_ means making components small and giving them a single responsibility, but it doesn't _always_ mean that.

In the example above, note that if we don't need to reuse either of the child components in multiple places, then we don't even need to make them separate entities; we can just inline them. Even though the resulting component will not be as small, and maybe we have to work a little to express its "single responsibility" in terms of slightly higher-level language, this change has made the system as a whole more intellectually manageable by colocating all of the parts that are concerned with that particular piece of state. We no longer have to pass state down through the hierarchy, nor manage callbacks just for the purposes of children "phoning home" back up the tree. We've factored away two child components that we would otherwise have had to come up with names for (and naming is one of [two hard things](https://martinfowler.com/bliki/TwoHardThings.html)), and perhaps we've even managed to get rid of a couple of separate files that would otherwise produce friction every time we have to move between them.

### When subtrees that must share state become large, use context

As components start to need to share state it may be tempting to reach for an external state management library. There are dozens of such libraries, but some notable examples include:

-   [Flux](https://facebook.github.io/flux/): The original "unidirectional data flow pattern" created at Facebook.
-   [Redux](https://redux.js.org/): A simple idea (using a reducer function to produce the "next state" from the "previous state" plus an "action") which has grown a large ecosystem of secondary patterns, helpers, and libraries.
-   [Undux](https://undux.org/): A rejection of the complexity and boilerplate of modern Redux, aims to be type-safe and as simple as possible.
-   [Recoil](https://recoiljs.org/): Similar to Undux, seeks to be a "simpler" Redux.
-   [Apollo Client](https://www.apollographql.com/docs/react/) or [Relay](https://relay.dev/): Two examples of libraries that go beyond simple state management and seek to encompass all communication with the server as well, via [GraphQL](https://graphql.org/).

Before reaching for a heavy-weight solution, use some additional tools from the React toolset:

-   [The `useContext` hook](https://reactjs.org/docs/hooks-reference.html#usecontext): Allows you to share values throughout an entire subtree without having to explicitly pass them down via ["prop drilling"](https://kentcdodds.com/blog/prop-drilling); only the components that actually care about that data need to use the `useContext` hook, and every other component can ignore it.
-   [The `useReducer` hook](https://reactjs.org/docs/hooks-reference.html#usereducer): Borrows the "reducer" idea from Redux of producing a "next state" from a "previous state" plus an action. Use this to explicitly encode transitions between states in one place. This is a useful way of consolidating what would otherwise be a bunch of informally related pieces of state into a single value where the relationship between the subparts is made explicit.

Note that these two hooks are flexible, and can be combined in various ways. For example:

-   Application state can be divided into multiple different contexts so that components can access subsets of state and ignore the rest. This more granular access can make the needs and behaviors of individual components easier to understand, and also avoids the situation where updating a single monolithic context would cause the entire app to re-render any time anything changed.
-   Reducers can be used to update the state that is managed by a context. Instead of passing down callbacks via prop drilling, a common pattern is to make a `dispatch` function available via context to anybody who needs to perform an action, and then individual components can use that to cause the shared state to update and then propagate back down through the app.

Ultimately, even if you do conclude that you want to use a heavier-weight state library, remember that it is usually not necessary to put _all_ of your application's data inside it; you can still follow the guideline of "Keep component state as close as possible to where it is needed" and benefit from simpler, easier-to-reason-about code with a lower barrier to entry in many places within your app.

### Only use state for things that must change and cause updates

Just because the `useState` hook and others are so convenient and handy to use doesn't mean that you have to use them for _everything_ that might be considered a "variable". React also provides:

-   [The `useRef` hook](https://reactjs.org/docs/hooks-reference.html#useref): Associates a mutable value with a component. You can write to and read from it freely, but updating it won't trigger a re-render.
-   [The `useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo) and [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) hooks: Store values that are expensive to compute (eg. `useMemo`) or which are functions whose identity you want to remain stable over time (eg. `useCallback`).

### Beware of stale closures

At the end of the day, hooks are just function calls and they work with JavaScript values. Notably, functions themselves can be passed around as values in JavaScript, and some common hook patterns make heavy use of this language feature. In addition to the already-mentioned `useMemo` and `useCallback`, hooks such as [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useeffect) and [`useLayoutEffect`](https://reactjs.org/docs/hooks-reference.html#uselayouteffect) both take functions as parameters. Given the prevalent use of functions in JS, it's important to have a good mental model for how closures operate, otherwise you may run into bugs.

The following simple example illustrates the potential pitfall using vanilla JS:

```js
for (var i = 0; i < 10; i++) {
	setTimeout(() => console.log(i));
}
```

Functions "close over" the variables in the scope in which they are defined. That means they continue to "see" the current value of the variable, even if execution has moved on from the scope in which the function was declared. In this example, the `setTimeout` calls mean that our `console.log` statements will all run after a brief delay, after the `for` loop has exited. _All_ ten calls will log the value `10`, because every instance of the function has access to the _same_ `i` variable and faithfully prints out its current value, not as it was at the time the `for` loop body ran, but as it is right now.

The above example won't work in modern JS with the `let` keyword (one of the reasons `let` was added to the language was to give JS a lexically-scoped binding mechanism with friendlier behavior in loop bodies, which means that [every iteration through the loop gets a fresh binding](https://2ality.com/2015/02/es6-scoping.html#let-in-loop-heads) and the code prints `0` through `9` as you would expect), but stale closure problems can easily still arise in the React world. The root cause is the same (closing over a variable in an undesired way), even if the way the problem manifests is different (see [this video for multiple examples](https://www.youtube.com/watch?v=eVRDqtTCd74)). In essence they all boil down to a function closing over a concrete value and then continuing to see that same value for the lifetime of the program:

```js
const [value, setValue] = useState(0);

useEffect(() => {
    const handle = setInterval(() => }
        setValue(value + 1);
    }, 1000);

    return () => clearInterval(handle);
}, []);
```

In this example, the author intends to increment `value` by `1` every second, but the code only increments it once even though the `setInterval` callback continues firing. What's actually happening here is:

1. On first render, `value` is initialized to `0`. `useEffect` runs and calls `setInterval`, with the expectation that `setValue(value + 1)` will run once per second from then on.
2. The `setInterval` callback fires, causing `setValue(value + 1)` to be executed. The closed-over `value` of `0` is used, so this effectively means `setValue(1)`.
3. Due to the state update, we render again. `value` is now `1`. `useEffect` runs again but does nothing (because there was no change to the items in the dependency array).
4. The `setInterval` callback fires again, again using the closed-over `value` of `0`. It does _not_ get the new value of `1`. So, we call `setValue(1)` again, which has no useful effect.

In practice, once you understand the nature of the stale closure problem, fixing it is usually quite easy. [This article](https://dmitripavlutin.com/react-hooks-stale-closures/) goes over some examples and solutions, such as:

- Providing dependency arrays that cause hooks to be re-evaluated when dependencies change (thus closing over new values).
- Using [the "functional update form"](https://reactjs.org/docs/hooks-reference.html#functional-updates) of the `useState` hook that gives you access to the current value at the time of making the update (eg. `setValue((previousValue) => previousValue + 1)`).

## Liferay's global state API

As of [LPS-127081](https://github.com/liferay-frontend/liferay-portal/pull/874) we have a new API for sharing and synchronizing state across apps, globally, in Liferay DXP.

> :warning: The API is not intended to be a store for **all state** in an application. The guideline to "Keep component state as close as possible to where it is needed" still holds true. This API is specifically for the subset of data that needs to be shared across otherwise independent applications within DXP.

TODO: actually write the rest of this

### When to use the global state API

### How to use the global state API

## Further reading

TODO: add links
