<script>
    import gameOver from './stores/gameOver';
    import screen from './stores/screen';

    import FightDetails from './FightDetails.svelte';
    import Menu from './Menu.svelte';
    import VillageMap from './VillageMap.svelte';
    import WorldMap from './WorldMap.svelte';
    import YouLost from './YouLost.svelte';
</script>

<style>
    main {
        display: grid;
        grid-template-rows: 10vh 1fr 15vh;
        height: 100%;
        text-align: center;
    }
</style>

{ #if $gameOver === gameOver.VICTORY }
    <span></span>
{ :else if $gameOver === gameOver.DEFEAT }
    <YouLost />
{ :else }
    <main>
        <Menu />

        { #if $screen === screen.WORLD }
            <WorldMap />
        { :else if $screen === screen.VILLAGE }
            <VillageMap />
        { /if }

        <FightDetails />
    </main>
{ /if }
