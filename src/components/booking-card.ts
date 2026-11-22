import type { Booking, BookingStatus, BookingStatusRequest } from '../models/booking'

export class BookingCard extends HTMLElement {
  static get observedAttributes(): string[] {
    return ['compact']
  }

  private current: Booking | null = null
  private article: HTMLElement
  private nameText: HTMLHeadingElement
  private seatsText: HTMLParagraphElement
  private sourceText: HTMLParagraphElement
  private statusText: HTMLParagraphElement
  private noteWrap: HTMLParagraphElement
  private button: HTMLButtonElement

  constructor() {
    super()

    const root = this.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
      :host { display: block; min-width: 0; font-family: inherit; }
      article { border: 1px solid #c5d7d0; border-radius: 12px; padding: 16px; background: white; color: #203a34; }
      h3 { margin: 0 0 8px; overflow-wrap: anywhere; }
      p { margin: 6px 0; }
      .note { color: #53655d; font-size: 14px; }
      button { background: var(--booking-accent, #355bd4); color: white; border: 0; border-radius: 6px; padding: 9px 14px; font: inherit; cursor: pointer; }
      button:disabled { background: #dfe6e3; color: #52665e; cursor: default; }
      button:focus-visible { outline: 3px solid #a15c00; outline-offset: 3px; }
    `

    this.article = document.createElement('article')
    this.nameText = document.createElement('h3')
    this.seatsText = document.createElement('p')
    this.sourceText = document.createElement('p')
    this.statusText = document.createElement('p')

    this.noteWrap = document.createElement('p')
    this.noteWrap.className = 'note'
    const slot = document.createElement('slot')
    slot.name = 'note'
    slot.textContent = 'Комментарий не задан'
    this.noteWrap.append(slot)

    this.button = document.createElement('button')
    this.button.type = 'button'

    this.article.append(
      this.nameText,
      this.seatsText,
      this.sourceText,
      this.statusText,
      this.noteWrap,
      this.button,
    )
    root.append(style, this.article)

    this.render()
  }

  set booking(value: Booking) {
    this.current = value
    this.render()
  }

  get booking(): Booking | null {
    return this.current
  }

  private render(): void {
    const booking = this.current

    if (!booking) {
      this.nameText.textContent = 'Ожидаю данные'
      this.seatsText.textContent = ''
      this.sourceText.textContent = ''
      this.sourceText.hidden = false
      this.statusText.textContent = ''
      this.noteWrap.hidden = true
      this.button.textContent = 'Подтвердить'
      this.button.disabled = true
      return
    }

    this.nameText.textContent = booking.name
    this.noteWrap.hidden = false

    if (this.hasAttribute('compact')) {
      this.seatsText.textContent = `${booking.seats} чел.`
      this.sourceText.hidden = true
    } else {
      this.seatsText.textContent = `Участников: ${booking.seats}`
      this.sourceText.hidden = false
      this.sourceText.textContent = `Источник: ${booking.source}`
    }

    if (booking.status === 'confirmed') {
      this.statusText.textContent = 'Подтверждена'
      this.button.textContent = 'Вернуть в очередь'
    } else {
      this.statusText.textContent = 'Новая заявка'
      this.button.textContent = 'Подтвердить'
    }
    this.button.disabled = false
  }

  private onAction = (): void => {
    if (!this.current) return
    const nextStatus: BookingStatus = this.current.status === 'new' ? 'confirmed' : 'new'
    const detail: BookingStatusRequest = { id: this.current.id, nextStatus }
    this.dispatchEvent(
      new CustomEvent<BookingStatusRequest>('booking-status-request', {
        detail,
        bubbles: true,
        composed: true,
      }),
    )
  }

  connectedCallback(): void {
    this.button.addEventListener('click', this.onAction)
  }

  disconnectedCallback(): void {
    this.button.removeEventListener('click', this.onAction)
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'compact' && oldValue !== newValue) {
      this.render()
    }
  }
}

customElements.define('booking-card', BookingCard)