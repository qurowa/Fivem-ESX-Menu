
ESX = nil



Citizen.CreateThread(function()
	while ESX == nil do
		TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
		Citizen.Wait(0)
	end

	local GUI      = {}
	GUI.Time       = 0
	local MenuType = 'default'

	local openMenu = function(namespace, name, data)
		SendNUIMessage({
			action    = 'openMenu',
			namespace = namespace,
			name      = name,
			data      = data,
		})

	end

	local closeMenu = function(namespace, name)
		SendNUIMessage({
			action    = 'closeMenu',
			namespace = namespace,
			name      = name,
			data      = data,
		})
	end

	ESX.UI.Menu.RegisterType(MenuType, openMenu, closeMenu)

	RegisterNUICallback('menu_submit', function(data, cb)
		local menu = ESX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)
		
		if menu.submit ~= nil then
			menu.submit(data, menu)
			PlaySound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0, 1)
		end

		cb('OK')
	end)

	RegisterNUICallback('menu_cancel', function(data, cb)
		local menu = ESX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)
		
		if menu.cancel ~= nil then
			menu.cancel(data, menu)
			PlaySound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0, 1)
		end

		cb('OK')
	end)

	RegisterNUICallback('menu_change', function(data, cb)
		local menu = ESX.UI.Menu.GetOpened(MenuType, data._namespace, data._name)

		for i=1, #data.elements, 1 do
			menu.setElement(i, 'value', data.elements[i].value)

			if data.elements[i].selected then
				menu.setElement(i, 'selected', true)
				PlaySound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0, 1)
			else
				menu.setElement(i, 'selected', false)
				PlaySound(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET", 0, 0, 1)
			end
		end

		if menu.change ~= nil then
			menu.change(data, menu)
		end

		cb('OK')
	end)

	Citizen.CreateThread(function()
		while true do
			Citizen.Wait(10)

			if IsInputDisabled(0) then
				if IsControlPressed(0, 18) then
					SendNUIMessage({action = 'controlPressed', control = 'ENTER'})
					Citizen.Wait(250)
				elseif IsControlPressed(0, 177) then
					SendNUIMessage({action  = 'controlPressed', control = 'BACKSPACE'})
					Citizen.Wait(250)
				elseif IsControlPressed(0, 27) then
					SendNUIMessage({action  = 'controlPressed', control = 'TOP'})
					Citizen.Wait(150)
				elseif IsControlPressed(0, 173) then
					SendNUIMessage({action  = 'controlPressed', control = 'DOWN'})
					Citizen.Wait(150)
				elseif IsControlPressed(0, 174) then
					SendNUIMessage({action  = 'controlPressed', control = 'LEFT'})
					Citizen.Wait(150)
				elseif IsControlPressed(0, 175) then
					SendNUIMessage({action  = 'controlPressed', control = 'RIGHT'})
					Citizen.Wait(150)
				end
			else
				Citizen.Wait(500)
			end
		end
	end)

end)