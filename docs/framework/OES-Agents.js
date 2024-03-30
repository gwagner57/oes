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
 * - receive messages sent by other agents, and react in response to them
 * - perceive their environment via perception events, and react in response to them
 * - send messages to other agents by scheduling message events
 * - perform actions by scheduling action events
 * An agent may have information about certain objects and agents.
 * For perfect information agents, the "objects" and "agents" parameters are lists of
 * object IDs that will be converted to maps.
 * For non-perfect information agents, these parameters are lists of records with
 * a "type" field and an "id" field the value of which corresponds to an existing
 * object or agent (in sim.objects or sim.agents).
 */
class aGENT extends oBJECT {
  constructor({id, name, hasPerfectInformation=true, objects=[], agents=[]}) {
    super( id, name);
    this.hasPerfectInformation = hasPerfectInformation;
    this.objects = Object.create(null);
    if (this.hasPerfectInformation) {
      for (const objId of objects) {
        if (!sim.objects.has( objId)) {
          throw Error(`Invalid object ID ${JSON.stringify(objId)} provided in constructor argument
'objects' for constructing aGENT with ID ${id}`);
        } else {
          this.objects[objId] = sim.objects.get( objId);
        }
      }
      //TODO: check in a second pass if sim.agents.has( objId)
      for (const objId of agents) {
        if (!(Number.isInteger(objId) || typeof objId === "string")) {
          throw Error(`Invalid object ID ${JSON.stringify(objId)} provided in constructor argument
'agents' for constructing aGENT with ID ${id}`);
        } else {
          this.agents[objId] = sim.agents.get( objId);
        }
      }
    } else {  // incomplete and possibly incorrect information
      for (const objRec of objects) {
        if (!(typeof objRec === "object" && "type" in objRec &&
            "id" in objRec && sim.objects.has( objRec.id))) {
          throw Error(`Invalid object record ${JSON.stringify(objRec)} provided in constructor argument
'objects' for constructing aGENT with ID ${id}`);
        } else {
          this.objects[objRec.id] = objRec;
        }
      }
      //TODO: check in a second pass if sim.agents.has( agtRec.id)
      for (const agtRec of agents) {
        if (!(typeof agtRec === "object" && "type" in agtRec && "id" in agtRec)) {
          throw Error(`Invalid object record ${JSON.stringify(agtRec)} provided in constructor argument
'agents' for constructing aGENT with ID ${id}`);
        } else {
          this.agents[agtRec.id] = agtRec;
        }
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
  // abstract methods (to be implemented in subclasses of aGENT)
  onReceive( message, sender, roundBased) {}
  onPerceive( perceptionEvent, roundBased) {}
  onTimeEvent( globalTimeEvent, roundBased) {}

  /** Execute agent for current simulation step (in round-based simulation mode)
   *  agtEvents are either message or perception events
   */
  executeStep( agtEvents) {
    const roundBased = true,
          followUpEvents=[];
    var resultingStateChanges=[], resultingFutureEvents=[];
    for (const agtEvt of agtEvents) {
      if (agtEvt instanceof pERCEPTIONeVENT) {
        [resultingStateChanges, resultingFutureEvents] = this.onPerceive( agtEvt, roundBased);
        //TODO: add resultingStateChanges to store
        followUpEvents.push(...resultingFutureEvents);
      } else if (agtEvt instanceof mESSAGEeVENT) {
        [resultingStateChanges, resultingFutureEvents] = this.onReceive( agtEvt.message, agtEvt.sender, roundBased);
        //TODO: add resultingStateChanges to store
        followUpEvents.push(...resultingFutureEvents);
      }
    }
    //TODO: return resultingStateChanges store and followUpEvents
    sim.schedule( followUpEvents);
  }
  // convenience method
  perform( actionEvt) { sim.schedule( actionEvt);}
  // convenience method
  send( message, receiver) {
    if (Array.isArray( receiver)) {  // multiple receivers
      sim.schedule( new mESSAGEeVENT({ message, sender:this, receivers: receiver}));
    } else {
      sim.schedule( new mESSAGEeVENT({ message, sender:this, receiver}));
    }
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
      if (typeof this.receiver.onReceive !== "function") console.log( JSON.stringify(this.receiver));
      this.receiver.onReceive( this.message, this.sender);
    } else if (Array.isArray( this.receivers)) {
      for (const r of this.receivers) {
        r.onReceive( this.message, this.sender);
      }
    } else {
      console.error(`Message event without receiver(s): ${this}`)
    }
    return [];  // no follow-up events
  }
}
mESSAGEeVENT.labels = {className: "MsgEvt"};

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
