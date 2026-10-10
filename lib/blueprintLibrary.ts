import type BlueprintType from 'factorio-blueprint';

// factorio-blueprint ships one build for `import` and another for `require`,
// and each keeps its own table of known entities. The generators use
// `require` and add entities to their copy (the big mining drill, anything
// modded), so the site has to read blueprints with that same copy or it
// does not know them. Everything in the site imports the library from here.
const Blueprint: typeof BlueprintType = require('factorio-blueprint');
type Blueprint = BlueprintType;

export default Blueprint;
