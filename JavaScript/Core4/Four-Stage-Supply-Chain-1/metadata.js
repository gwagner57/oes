var sim = sim || {};
sim.model = sim.model || {};
sim.scenario = sim.scenario || {};
sim.config = sim.config || {};

var oes = oes || {};
oes.ui = oes.ui || {};
oes.ui.explanation = {};
oes.ui.i18n = {transDates:{}, changeDates:{}};

/*******************************************************
 Simulation Model
********************************************************/
sim.model.name = "Blind-Jumper-1";
sim.model.title = "The Blind Jumper: Emerging Semantics through Reinforcement Learning";
sim.model.systemNarrative = '<p>In this scenario, there is an agent ' +
    '(the "jumper") that is not able to see the size of the barrier over which he has to jump, and there is ' +
    'another agent (the "speaker") that is able to see the size of the barrier and tries to communicate the right '+
    'jump length to the jumper.	However, the jumper and the speaker do not speak the same language, so both agents '+
    'first have to learn which signal communicates which jump length. Both agents can perceive the success or failure ' +
    'of a jump (a jump fails if it is too short or too long), and then update their signalling, resp. signal interpretation, ' +
    'function, accordingly.</p>';
sim.model.shortDescription = "<p>The model defines three object types: <i>Jumper</i>, <i>Speaker</i> and <i>Barrier</i>, " +
    "and three event types: <i>Tell</i>, <i>Jump</i> and <i>StartOver</i>. The simulation of learning by trial and failure "+
	"is based on repeated rounds of a <i>Tell</i>&rightarrow;<i>Jump</i>&rightarrow;<i>StartOver</i> event sequence. The " +
    "function to be learned is expressed as a probability matrix where the row index, representing the current (information) "+
    "state, is mapped to a column index, representing an action option, by choosing the column with the maximal cell value. </p>"+
    "<p>First, in a <i>Tell</i> event, the speaker, seeing the current length of the barrier, tries to communicate this " +
    "information to the blind jumper using a symbol from his symbol set {A, B, C} based on his learning matrix. </p>" +
    "<p>Then, for taking a decision on the length of the next <i>Jump</i>, the jumper maps the received symbol to a possible jump " +
    "length (1-4) using his learning matrix and then tries to jump over the barrier. Subsequently, both the speaker " +
    "and the jumper update their learning matrices: when the jump was a success, they increase the probability "+
    "of their signalling choice, resp. signal interpretation choice, while they decrease it when the jump was a failure. </p>" +
    "<p>Finally, a <i>StartOver</i> event occurs, resetting the jumper's position and modifying the length of the barrier. </p>" +
    "<p>The simulated learning process goes on until the two learning matrices become stable. This means that the two " +
    "agents were able to find a common language that allows communicating the barrier length. </p>" +
	"<p>Remarkably, the <em>Blind Jumper</em> by Peter Fleissner and Gregor Fleissner is a minimal model for "+
	"teaching/&shy;learning/&shy;illustrating <em>multi-agent reinforcement learning</em>.</p>";
sim.model.source = "<a href='http://peter.fleissner.org/petergre/documents/blinderspringer.html'>Beyond the Chinese Room: "+
    "The Blind Jumper</a> - Self-Organised Semantics and Pragmatics on the Computer. By Peter Fleissner and Gregor Fleissner (in German). "+
    "In W. Hofkirchner (Ed.), Information und Selbstorganisation - Annäherungen an eine vereinheitlichte Theorie der Information, "+
    "StudienVerlag, Innsbruck/Wien, pp. 325-340, 1998.";
sim.model.sourceAuthors = "P. Fleissner and G. Fleissner";
sim.model.license = "CC BY-NC";
sim.model.creator = "Yassir Sellal";
sim.model.contributors = "G. Wagner";
sim.model.created = "2019-07-15";
sim.model.modified = "2019-09-19";

