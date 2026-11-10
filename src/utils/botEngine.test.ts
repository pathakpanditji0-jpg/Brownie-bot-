import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBotOwnerOrAdmin,
  isOwnerQuestion,
  createInitialServerState,
  executeBotCommand,
  formatCustomGreeting,
  SERVER_USERS,
} from './botEngine';

test('recognizes akshatkrofficial_47531 and killer_sole5 as bot owners/admins', () => {
  const akshat = SERVER_USERS.find((u) => u.username === 'akshatkrofficial_47531')!;
  const killer = SERVER_USERS.find((u) => u.username === 'killer_sole5')!;
  const regular = SERVER_USERS.find((u) => u.username === 'shadow_yapper99')!;

  assert.equal(isBotOwnerOrAdmin(akshat), true);
  assert.equal(isBotOwnerOrAdmin(killer), true);
  assert.equal(isBotOwnerOrAdmin(regular), false);
});

test('allows akshatkrofficial_47531 and killer_sole5 to execute admin commands (*givecash, *roast on/off, *noprefix)', () => {
  const initialState = createInitialServerState();
  const killer = SERVER_USERS.find((u) => u.username === 'killer_sole5')!;
  const regular = SERVER_USERS.find((u) => u.username === 'shadow_yapper99')!;

  const beforeWallet = initialState.accounts['shadow_yapper99'].wallet;
  const giveRes = executeBotCommand('*givecash shadow_yapper99 5000', killer, initialState);
  assert.equal(giveRes.handled, true);
  assert.equal(giveRes.isError, undefined);
  assert.equal(
    giveRes.updatedState.accounts['shadow_yapper99'].wallet,
    beforeWallet + 5000
  );

  // Regular member cannot execute *givecash
  const blockedRes = executeBotCommand('*givecash killer_sole5 5000', regular, giveRes.updatedState);
  assert.equal(blockedRes.handled, true);
  assert.equal(blockedRes.isError, true);

  // Owner can toggle roast mode
  const roastOff = executeBotCommand('*roast off', killer, blockedRes.updatedState);
  assert.equal(roastOff.updatedState.config.roastMode, false);

  // Regular member cannot toggle roast mode
  const unauthorizedRoast = executeBotCommand('*roast on', regular, roastOff.updatedState);
  assert.equal(unauthorizedRoast.isError, true);
  assert.equal(unauthorizedRoast.updatedState.config.roastMode, false);
});

test('customization module commands: setgreeting, roasttopic, roasttarget, roaststyle', () => {
  let state = createInitialServerState();
  const akshat = SERVER_USERS.find((u) => u.username === 'akshatkrofficial_47531')!;
  const regular = SERVER_USERS.find((u) => u.username === 'shadow_yapper99')!;

  // 1. Custom greeting
  const greetRes = executeBotCommand(
    '*setgreeting Yo @{user}, welcome to {server}—brace for roasts!',
    akshat,
    state
  );
  state = greetRes.updatedState;
  assert.equal(
    state.config.customization.customGreeting,
    'Yo @{user}, welcome to {server}—brace for roasts!'
  );
  assert.equal(
    formatCustomGreeting(state.config.customization.customGreeting, 'killer_sole5', 'Roast HQ'),
    'Yo @killer_sole5, welcome to Roast HQ—brace for roasts!'
  );

  // 2. Roast topic add & remove
  const topicRes = executeBotCommand('*roasttopic add whiffed ultimates in valorant', akshat, state);
  state = topicRes.updatedState;
  assert.equal(
    state.config.customization.roastTopics.includes('whiffed ultimates in valorant'),
    true
  );

  // 3. Priority roast target add
  const targetRes = executeBotCommand(
    '*roasttarget add @choco_grinder Always begs for Chocochips after losing slots',
    akshat,
    state
  );
  state = targetRes.updatedState;
  const foundTarget = state.config.customization.priorityTargets.find(
    (t) => t.target === 'choco_grinder'
  );
  assert.equal(
    foundTarget?.angle,
    'Always begs for Chocochips after losing slots'
  );

  // 4. Roast style change
  const styleRes = executeBotCommand('*roaststyle Esports Caster', akshat, state);
  state = styleRes.updatedState;
  assert.equal(state.config.customization.roastStyle, 'Esports Caster');

  // 5. Non-admin cannot change roast style or greeting
  const blockedStyle = executeBotCommand('*roaststyle Deadpan Sarcasm', regular, state);
  assert.equal(blockedStyle.isError, true);
  assert.equal(blockedStyle.updatedState.config.customization.roastStyle, 'Esports Caster');
});

test('detects owner questions in English and Hinglish', () => {
  assert.equal(isOwnerQuestion('who is your owner?'), true);
  assert.equal(isOwnerQuestion('tumhara owner kaun hai'), true);
  assert.equal(isOwnerQuestion('hello how are you'), false);
});
