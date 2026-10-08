local RoundService = {}
RoundService.state = "Lobby"
function RoundService.start()
    assert(RoundService.state == "Lobby", "Round already active")
    RoundService.state = "Playing"
end
function RoundService.finish()
    RoundService.state = "Lobby"
end
return RoundService
