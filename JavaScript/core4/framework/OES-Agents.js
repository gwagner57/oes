/*******************************************************************************
 * This library file contains the elements of the OES Agents package
 * @copyright Copyright 2022 Gerd Wagner, BTU (Germany)
 * @license The MIT License (MIT)
 * @author Gerd Wagner
 ******************************************************************************/

/******************************************************************************
 *** Agents Package ***********************************************************
 ******************************************************************************/
/**
 * Agents are objects that are able to
 * - receive messages sent by other agents by reacting to in-message events
 * - perceive their environment (its objects and events) by reacting to perception events
 * - send messages to other agents by scheduling out-message events
 * - perform actions by scheduling action events
 * An agent may have information about certain objects and agents.
 */
class aGENT extends oBJECT {
  constructor({id, name, hasPerfectInformation=true, objects, agents}) {
    super( id, name);
    this.hasPerfectInformation = hasPerfectInformation;
    if (this.hasPerfectInformation) {  // the agent knows all objects and agents
      this.objects = sim.objects;
      this.agents = sim.agents;
    } else {  // incomplete and possibly incorrect information
      // a map of references to the objects that the agent knows
      if (objects) {  // array or map
        if (Array.isArray( objects)) {
          this.objects = Object.create( null);
          for (const o of objects) {
            if (!(o instanceof oBJECT)) throw `Invalid object ${JSON.stringify(o)} provided for constructing aGENT`;
            this.objects[o.id] = o;
          }
        } else if (typeof objects === "object") {
          this.objects = objects;
        } else throw Error(`Invalid objects argument provided for constructing aGENT: ${JSON.stringify(objects)}`);
      }
      // a map of references to the agents that the agent knows
      if (agents) {  // array or map
        if (Array.isArray( agents)) {
          this.agents = Object.create( null);
          for (const a of agents) {
            if (!(a instanceof aGENT)) throw Error(`Invalid agent ${JSON.stringify(a)} provided for constructing aGENT`);
            this.agents[a.id] = a;
          }
        } else if (typeof agents === "object") {
          this.agents = agents;
        } else throw Error(`Invalid agents argument provided for constructing aGENT: ${JSON.stringify(agents)}`);
      }
    }
    if (sim.config.roundBasedAgentExecution) {
      this.roundBasedExecution = true;  // set execution mode flag
      this.inMessageEventBuffer = [];
      this.perceptionBuffer = [];
      this.globalTimeEventBuffer = [];
    }
    // add each new agent to the Map of simulation agents
    sim.agents.set( this.id, this);
  }
  // abstract methods (to be implemented in subclasses)
  onReceive( message, sender, roundBased) {}
  onPerceive( perceptionEvent, roundBased) {}
  onTimeEvent( globalTimeEvent, roundBased) {}

  /** Execute agent for current simulation step (in round-based simulation mode)
   *  agtEvents are either message or perception events
   */
  executeStep( agtEvents) {
    const roundBased = true,
          followUpEvents=[];
    var resultingEvents=[];
    for (const agtEvt of agtEvents) {
      if (agtEvt instanceof pERCEPTIONeVENT) {
        resultingEvents = this.onPerceive( agtEvt, roundBased);
        followUpEvents.push(...resultingEvents);
      } else if (agtEvt instanceof mESSAGEeVENT) {
        resultingEvents = this.onReceive( agtEvt.message, agtEvt.sender, roundBased);
        followUpEvents.push(...resultingEvents);
      }
    }
    sim.schedule( followUpEvents);
  }
  // convenience method
  perform( actionEvt) { sim.schedule( actionEvt);}
  // convenience method
  send( message, receiver) {
    sim.schedule( new mESSAGEeVENT({ message, sender:this, receiver}));
  }
  // convenience method
  broadcast( message) {
    if (typeof this.agents === "object") {  // a map
      const receivers = [];
      for (const agt of Object.values( this.agents)) {
        receivers.push( agt);
      }
      sim.schedule( new mESSAGEeVENT({message, sender:this, receivers}));
    }
  }
  // receive a generic Tell message with a triple statement
  /*
  onReceiveTell(statement, sender) {
    if (sender.hasPerfectInformation) {
      this.objects[statement.objId][statement.propName] = statement.value;
    }
  }
  */
  // overwrite/improve the standard toString method
  /*
  toString() {
    return "agt-"+ (this.name||this.id);
  }
  */
}
/**
 * Reinforcement learning agents have a learned decision function and two
 * training methods: learnSuccess and learnFailure
 */
class rEINFORCEMENTlEARNINGaGENT extends aGENT {
  constructor({id, name, hasPerfectInformation=true, objects, agents, learnFunction}) {
    super({id, name, hasPerfectInformation, objects, agents});
    this.learnFunction = learnFunction;
    this.currentStateTypeNo = 0;  // the state type number of the current RL action choice
    this.chosenActionNo = 0;  // the action number of the current RL action choice
  }
  // update the RL decision function in the case of success
  learnSuccess() {
    if (this.currentStateTypeNo && this.chosenActionNo) {
      this.learnFunction.learnSuccess( this.currentStateTypeNo, this.chosenActionNo);
      //console.log("Success "+ this.learnFunction.toString());
    }
  }
  // update the RL decision function in the case of failure
  learnFailure() {
    if (this.currentStateTypeNo && this.chosenActionNo) {
      this.learnFunction.learnFailure( this.currentStateTypeNo, this.chosenActionNo);
      //console.log("Failure "+ this.learnFunction.toString());
    }
  }
}

/**
 * Perception events are processed by the simulator by invoking the perceiver's
 * perceive method.
 */
class pERCEPTIONeVENT extends eVENT {
  constructor({occTime, delay, perceiver}) {
    super({occTime, delay});
    // id or object reference
    this.perceiver = typeof perceiver === "object" ? perceiver : sim.objects.get( perceiver);
  }
  // default event handler for interleaved simulation mode
  onEvent() {
    this.perceiver.onPerceive( this);
    return [];  // no follow-up events
  }
}
pERCEPTIONeVENT.labels = {"percept":"perc"};

/**
 * Action events are processed by the simulator by invoking the onEvent method
 * of the specific action event.
 */
class aCTION extends eVENT {
  constructor({occTime, delay, performer}) {
    super({occTime, delay});
    // id or object reference
    this.performer = typeof performer === "object" ? performer : sim.objects.get( performer);
  }
  onEvent() {}  // abstract method
}
aCTION.labels = {"action":"act"};

/**
 * Abstract class to be extended by reinforcement learning action event classes
 * that define (a) the properties "success" and possibly "othersToBeRewarded",
 * and (b) an onEvent method invoking the problem-independent onEvent method
 * of the abstract superclass and taking care of performing the problem-specific
 * action.
 */
class rEINFORCEMENTlEARNINGaCTION extends aCTION {
  constructor({ occTime, delay, performer, success, othersToBeRewarded=[]}) {
    super({occTime, delay, performer});
    this.success = success;  // Boolean
    this.othersToBeRewarded = othersToBeRewarded;
  }
  onEvent() {
    if (this.success) {
      this.performer.learnSuccess();
      for (const agt of this.othersToBeRewarded) {
        agt.learnSuccess();
      }
    } else {
      this.performer.learnFailure();
      for (const agt of this.othersToBeRewarded) {
        agt.learnFailure();
      }
    }
    return [];  // no follow-up events
  }
}
/**
 * Message events are processed by the simulator by invoking the receivers'
 * receive method.
 */
class mESSAGEeVENT extends eVENT {
  constructor({ occTime, delay, sender, receiver, receivers, message}) {
    super({occTime, delay});
    // id or object reference
    this.sender = Number.isInteger( sender) || typeof sender === "string" ?
        sim.agents[sender] : sender;
    if (receiver) {
      this.receiver = Number.isInteger( receiver) || typeof receiver === "string" ?
          sim.agents[receiver] : receiver;
    } else if (Array.isArray( receivers)) {
      this.receivers = [];
      for (const r of receivers) {
        this.receivers.push( Number.isInteger(r) || typeof r === "string" ? sim.agents[r] : r);
      }
    } else throw Error(`Cannot construct mESSAGEeVENT ${this.toString()} without receiver(s)`);
    this.message = message;
  }
  // default event handler for interleaved simulation mode
  onEvent() {
    if (this.receiver) {
      this.receiver.onReceive( this.message, this.sender);
    } else if (Array.isArray( this.receivers)) {
      for (const r of this.receivers) {
        this.r.onReceive( this.message, this.sender);
      }
    } else {
      console.error(`Message event without receiver(s): ${this}`)
    }
    return [];  // no follow-up events
  }
}
mESSAGEeVENT.labels = {"message":"msg"};

/**
 * Time events are processed by the simulator by invoking the onTimeEvent method
 * of all agents.
 */
class tIMEeVENT extends eVENT {
  constructor({ occTime, delay}) {
    super({occTime, delay});
  }
  // default event handler for interleaved simulation mode
  onEvent() {
    for (const agt of sim.agents.values()) {
      agt.onTimeEvent( this);
    }
    return [];  // no follow-up events
  }
}
