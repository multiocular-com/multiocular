<script lang="ts">
  import type { Snippet } from 'svelte'
  import type {
    HTMLAnchorAttributes,
    HTMLButtonAttributes,
    MouseEventHandler
  } from 'svelte/elements'

  let {
    children,
    disabled,
    onclick,
    padding = 'm',
    state,
    variant = 'simple',
    ...props
  }: {
    children: Snippet
    disabled?: boolean
    onclick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
    padding?: 'm' | 's' | false
    state?: 'hover' | 'pressed'
    variant?: 'ghost' | 'simple'
  } & (
    | ({ href: string } & HTMLAnchorAttributes)
    | ({ href?: undefined } & HTMLButtonAttributes)
  ) = $props()
</script>

{#if typeof props.href !== 'undefined'}
  <a
    {...props}
    class="button"
    class:is-ghost={variant === 'ghost'}
    class:is-hover={state === 'hover'}
    class:is-padding-m={padding === 'm'}
    class:is-padding-s={padding === 's'}
    class:is-pressed={state === 'pressed'}
    class:is-simple={variant === 'simple'}
    aria-disabled={disabled}
    href={props.href}
    onclick={onclick
      ? e => {
          if (!disabled) onclick(e)
        }
      : null}
  >
    <div class="button_cap">
      {@render children()}
    </div>
  </a>
{:else}
  <button
    {...props}
    class="button"
    class:is-ghost={variant === 'ghost'}
    class:is-hover={state === 'hover'}
    class:is-padding-m={padding === 'm'}
    class:is-padding-s={padding === 's'}
    class:is-pressed={state === 'pressed'}
    class:is-simple={variant === 'simple'}
    aria-disabled={disabled}
    onclick={onclick
      ? e => {
          if (!disabled) onclick(e)
        }
      : null}
    type={props.type || 'button'}
  >
    <div class="button_cap">
      {@render children()}
    </div>
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    font: var(--control-font);
    color: currentcolor;
    text-decoration: none;
    background: transparent;
    border: none;
    border-radius: var(--radius);
    corner-shape: squircle;

    &.is-padding-m {
      padding-inline: 0.5rem;
    }

    &.is-padding-s {
      padding-inline: 0.2rem;
    }

    &.is-simple {
      background: var(--panel-color);
      box-shadow: var(--button-border);

      &:hover,
      &:active,
      &.is-hover,
      &.is-pressed {
        background: var(--panel-hover-color);
      }
    }

    &.is-ghost {
      &:hover,
      &:active,
      &.is-hover,
      &.is-pressed {
        background: var(--panel-hover-color);
      }
    }

    &&:active,
    &&.is-pressed {
      box-shadow: var(--pressed-shadow);
    }

    &:focus-visible {
      outline-offset: 0;
    }
  }

  .button_cap {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    min-height: var(--button-height);
    line-height: 1;

    .button:active &,
    .button.is-pressed & {
      translate: 0 1px;
    }
  }
</style>
