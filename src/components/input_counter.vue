<template>
    <div class="input" :class="{'is-active': isFocused}">
        <input :value="value"
        @input="$emit('input', $event.target.value)"
        @focus="isFocused=true"
        @focusout="isFocused=false"
        @keyup.enter="$emit('enter')"
        :maxlength="maxlength"
        :name="name"
        :type="type"
        :placeholder="placeholder"
        class="input-instance">
        <span class="is-size-7 has-text-grey">{{value ? value.length : '0'}}/{{maxlength}}</span>
    </div>
</template>

<script>
export default {
    name: 'input_counter',
    props: [
        'maxlength',
        'name',
        'type',
        'value',
        'placeholder'
    ],
    data() {
        return {
            isFocused: false
        }
    }
}
</script>

<style>
.input-instance {
  width: 100%;
  height: 100%;
  border: 0px none rgb(0,0,0);
  font-size: inherit;
}

.input-instance:focus {
  outline-width: 0;
}
</style>
