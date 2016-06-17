const { assert } = require('chai');


describe('utils', () => {
  const utils = require('../src/utils');
  const inner = utils.$$inner;

  describe('#pipe', () => {
    const { pipe } = utils;

    it('should execute functions with pipe sequence', () => {
      const funcList = [
        v => (assert.strictEqual(v, 2), v + 5),
        v => (assert.strictEqual(v, 7), v * 9),
        v => (assert.strictEqual(v, 63)),
      ];

      pipe(funcList)(2);
      pipe(...funcList)(2);
    });

    it('should pass value one by one within functions', () => {
      const val = {};

      pipe(
        v => (assert.strictEqual(v, val), val),
        v => (assert.strictEqual(v, val))
      )(val);
    });
  });


  describe('$$inner#unformatChannelAndUser', () => {
    const rtm = {
      dataStore: {
        users: { U024BE7LH: { name: 'user-name-bar' } },
        channels: { C024BE7LR: { name: 'channel-name-foo' } },

        getUserById(id) {
          return this.users[id];
        },

        getChannelById(id) {
          return this.channels[id];
        },
      },
    };

    const { unformatChannelAndUser } = inner;
    const unformat = message => unformatChannelAndUser({ rtm, message });

    it('should unformat channel and user', () => {
      assert.strictEqual(unformat('Hi! <@U024BE7LH> user'), 'Hi! @user-name-bar user');
      assert.strictEqual(unformat('Hi! <#C024BE7LR> channel'), 'Hi! #channel-name-foo channel');
      assert.strictEqual(unformat('Hi! <@U024BE7LH> user and <#C024BE7LR> channel'),
        'Hi! @user-name-bar user and #channel-name-foo channel');
    });
  });


  describe('$$inner#unformatLink', () => {
    const { unformatLink } = inner;

    it('should unformat URL link', () => {
      assert.strictEqual(unformatLink('Link to <http://foo.com/> !'), 'Link to http://foo.com/ !');
      assert.strictEqual(unformatLink('Link to <https://foo.com/> !'), 'Link to https://foo.com/ !');
      assert.strictEqual(unformatLink('Link to <http://foo.com/|foo.com> !'), 'Link to foo.com !');
      assert.strictEqual(unformatLink('Mail to <mailto:bar@foo.com|bar@foo.com> !'), 'Mail to bar@foo.com !');
    });
  });


  describe('$$inner#unformatDefinedCommand', () => {
    const { unformatDefinedCommand } = inner;

    it('should unformat defined commands', () => {
      assert.strictEqual(unformatDefinedCommand('Say Hi to <!channel> !'), 'Say Hi to @channel !');
      assert.strictEqual(unformatDefinedCommand('Say Hi to <!here> !'), 'Say Hi to @here !');
      assert.strictEqual(unformatDefinedCommand('Say Hi to <!group> !'), 'Say Hi to @group !');
      assert.strictEqual(unformatDefinedCommand('Say Hi to <!everyone> !'), 'Say Hi to @everyone !');
    });
  });


  describe('$$inner#unformatHtmlEntity', () => {
    const { unformatHtmlEntity } = inner;

    it('should unformat HTML entities', () => {
      assert.strictEqual(unformatHtmlEntity('HTML &lt;div&gt; &amp; &lt;span&gt;'), 'HTML <div> & <span>');
    });
  });


  describe('$$inner#unformatEmoji', () => {
    const { unformatEmoji } = inner;

    it('should unformat emoji', () => {
      assert.strictEqual(unformatEmoji(':kiss::frog::ribbon::traffic_light::sparkling_heart::smirk::heart:'),
        '💋🐸🎀🚥💖😏❤');
    });
  });
});
