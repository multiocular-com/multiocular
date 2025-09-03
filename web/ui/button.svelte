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
    variant,
    ...props
  }: {
    children: Snippet
    disabled?: boolean
    onclick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>
    variant?: 'ghost'
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
    padding: 0.2rem;
    color: currentcolor;
    border: none;
    border-radius: 0.25rem;
    corner-shape: squircle;

    &.is-ghost {
      background: transparent;

      &:hover,
      &:active,
      &.is-pressed {
        background: var(--ghost-hover-color);
      }
    }

    &:active,
    &.is-pressed {
      box-shadow: var(--pressed-shadow);
    }

    &:focus-visible {
      outline-offset: 0;
    }
  }

  .button_cap {
    .button:active &,
    .button.is-pressed & {
      translate: 0 1px;
    }
  }
</style>
