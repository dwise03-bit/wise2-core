import {describe,it,expect} from 'vitest';
import {can} from './permissions.js';
describe('creator authority',()=>{
 it('allows audience participation without creative takeover',()=>{expect(can('VIEWER','vote')).toBe(true);expect(can('VIEWER','promote_version')).toBe(false);expect(can('VIEWER','manage_roles')).toBe(false)});
 it('separates moderation from creative authority',()=>{expect(can('MODERATOR','moderate_chat')).toBe(true);expect(can('MODERATOR','promote_version')).toBe(false)});
 it('gives owner onboarding controls',()=>{expect(can('OWNER','manage_roles')).toBe(true);expect(can('OWNER','change_crowd_mode')).toBe(true)});
});
