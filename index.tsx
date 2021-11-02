import { React, getByDisplayName, UserStore, MessageActions } from '@webpack';
import { findInReactTree, suppressErrors } from '@util';
import { after, unpatchAll } from '@patcher';
import { UPlugin } from '@classes';

import ToLowerCase from './ToLowerCase.svg';

export default class QuickLowerCase extends UPlugin {
  start(): void {
    suppressErrors(this.patchMiniPopover.bind(this))();
  }

  patchMiniPopover(): void {
    const MiniPopover = getByDisplayName('MiniPopover', { onlyModule: true });
    const { Button } = MiniPopover;
    function patchedMe(props) {
      try {
        const { message, channel } = props;
        const onClick = React.useCallback(() => {
          MessageActions.editMessage(channel.id, message.id, { content: message.content.toLowerCase() });
        }, []);
        const ret = props.__QLC_me(props);
        if (message.author.id === UserStore.getCurrentUser().id && message.content !== message.content.toLowerCase()) ret.props.children.unshift(<Button onClick={onClick}>
          <ToLowerCase/>
        </Button>);
        return ret;
      } catch (err) {
        console.error('shit', err);
        return null;
      }
    }
    after('quick-lower-case', MiniPopover, 'default', (_, [props], ret) => {
      const popout = findInReactTree(ret, e => typeof e.props?.showMoreUtilities === 'boolean');
      if (!popout) return;
      popout.props.__QLC_me = popout.type;
      popout.type = patchedMe;
    });
  }

  stop(): void {
    unpatchAll('quick-lower-case');
  }
}
