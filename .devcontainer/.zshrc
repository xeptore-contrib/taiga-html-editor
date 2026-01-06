export ZSH="$HOME/.oh-my-zsh"

# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
ZSH_THEME="half-life"
CASE_SENSITIVE="true"

zstyle ':omz:update' mode reminder

zstyle ':omz:plugins:eza' 'dirs-first' yes

plugins=(git eza zsh-autosuggestions npm node)

source $ZSH/oh-my-zsh.sh

alias gclean='git repack -ad && git prune-packed && git prune && git gc --aggressive --force --auto'
alias grbsg='git rebase --signoff --gpg-sign'
alias gcssa='git commit --signoff --gpg-sign --date=now --amend'
alias gcssa!='git commit --signoff --gpg-sign --date=now --no-edit --amend'
alias gfap='git fetch --all --prune --tags --prune-tags --jobs=10'
alias gmsg!='gm --signoff --gpg-sign --no-ff --no-squash --no-edit'
alias rimraf='rm -rf'
alias dig='dig +noall +answer'
alias clear='clear && clear'
alias batp='bat -p'
alias batpp='bat -pp'
