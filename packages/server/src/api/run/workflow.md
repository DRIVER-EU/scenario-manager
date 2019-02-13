# Workflow

## Starting a new Session

GOAL: To load a Trial, select a Scenario, and start a new Session.

1. Users selects a Trial in the GUI.
2. User selects a Scenario in the GUI.
3. User creates a new Session (id and name) and 'activates' it.
  User may change the start time of the scenario *before* activating. Not afterwards, since delay/start at conditions use it.
4. Service loads the Trial and Scenario and starts a new session.
5. User starts the fictive time.
6. Service sends a time control start message.
7. The Test-bed's time service starts sending out fictive time updates.

## Running a Session: 'Game loop'

TODO:

- Refactor level => type, type => subType or messageType
- Remove state from Inject
- Add service to execute a manual or role-player inject / to initiate a state transfer
  - SCHEDULED -> IN_PROGRESS
  - IN_PROGRESS -> EXECUTED
  - SCHEDULED OR ON_HOLD -> CANCELLED

GOAL: To send out messages to control the Trial.

### Initialize

1. Prune the total list of injects: only keep the current scenario and its children.
2. Sort the pruned injects by level (first Scenario, Storyline, next Act, finally Inject).
3. Create a read-only/frozen map, lookup, (id => injects) of all injects for easy retrieval.
4. Create a map, state, (id => { state: InjectState.ON_HOLD, lastTransitionAt: Date }) of all injects. No conditions (e.g. for Scenario): set state to IN_PROGRESS.
5. Create an empty transitionQueue (id => { stateTransferRequest: { from: InjectState, to: InjectState }}).

### Game Loop

It starts when the fictive time is started. It is paused when the fictive time is paused (except for manual interactions, perhaps).

1. Process all messages in the transitionQueue for state updates, e.g. a manually activated inject or an inject that is executed and perform the action is appropriate (i.e. the from state is still valid).
2. Loop over all injects and evaluate its conditions when state is not EXECUTED or CANCELLED:
   1. All: transition state from ON_HOLD to SCHEDULED when its parent is IN_PROGRESS.
   2. StartAt or Delay: if state is SCHEDULED and startAt condition is later than the fictive simulation time, transition to IN_PROGRESS.
3. Loop over all injects IN_PROGRESS again and perform the required action.
   1. Send a message: retrieve the data (from the asset store?) and send the message to the right topic. When done, move state to EXECUTED.
   2. Role player task: do nothing. Requires manual interaction from role player, requesting a state transition.
4. Send a stateUpdate message to the connected clients [{id, state, lastTransitionAt}].
